/**
 * Video Logo Remover - Client-Side Interactive Studio
 * ALL-IN-ONE-v1 | 100% Client-Side & Offline, Powered by MediaRemovalEngine
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = window.MediaRemovalEngine;
  if (!engine) {
    console.error('MediaRemovalEngine shared library not loaded.');
    return;
  }

  // Configuration for Video Logo Remover
  const CONFIG = {
    toolType: 'logo',
    toolTitle: 'Logo',
    defaultAlgorithm: 'delogo',
    defaultMode: 'box',
    initialBox: { x: 0.70, y: 0.08, w: 0.25, h: 0.18 },
    detectFn: (frameData) => engine.autoDetectLogos(frameData, { sensitivity: 0.65 })
  };

  // DOM Elements - Upload & Setup
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const sampleBtn = document.getElementById('sample-btn');

  // Info Strip
  const infoStrip = document.getElementById('info-strip');
  const fileNameEl = document.getElementById('file-name');
  const videoDimsEl = document.getElementById('video-dims');
  const videoDurationEl = document.getElementById('video-duration');
  const detectionBadge = document.getElementById('detection-badge');
  const changeVideoBtn = document.getElementById('change-video-btn');
  const resetVideoBtn = document.getElementById('reset-video-btn');

  // Studio Grid & Viewport
  const studioGrid = document.getElementById('studio-grid');
  const videoStageWrapper = document.getElementById('video-stage-wrapper');
  const sourceVideo = document.getElementById('source-video');
  const stageCanvas = document.getElementById('stage-canvas');
  const stageCtx = stageCanvas.getContext('2d', { willReadFrequently: true });

  // Overlays & Actions
  const processOverlay = document.getElementById('process-overlay');
  const processStatus = document.getElementById('process-status');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const processFrameInfo = document.getElementById('process-frame-info');
  const processTimeInfo = document.getElementById('process-time-info');
  const cancelProcessBtn = document.getElementById('cancel-process-btn');
  const statusIndicator = document.getElementById('status-indicator');

  const compareBtn = document.getElementById('compare-btn');
  const clearSelectionBtn = document.getElementById('clear-selection-btn');

  // Playback Controls
  const playPauseBtn = document.getElementById('play-pause-btn');
  const iconPlay = playPauseBtn.querySelector('.icon-play');
  const iconPause = playPauseBtn.querySelector('.icon-pause');
  const stepBackBtn = document.getElementById('step-back-btn');
  const stepForwardBtn = document.getElementById('step-forward-btn');
  const currentTimeText = document.getElementById('current-time-text');
  const durationTimeText = document.getElementById('duration-time-text');
  const timelineSlider = document.getElementById('timeline-slider');
  const muteBtn = document.getElementById('mute-btn');
  const iconVolume = muteBtn.querySelector('.icon-volume');
  const iconMuted = muteBtn.querySelector('.icon-muted');
  const volumeSlider = document.getElementById('volume-slider');
  const loopToggleBtn = document.getElementById('loop-toggle-btn');

  // Control Panel
  const modeBoxBtn = document.getElementById('mode-box-btn');
  const modeBrushBtn = document.getElementById('mode-brush-btn');
  const brushControls = document.getElementById('brush-controls');
  const brushSizeSlider = document.getElementById('brush-size-slider');
  const brushSizeVal = document.getElementById('brush-size-val');
  const brushEraserBtn = document.getElementById('brush-eraser-btn');
  const brushUndoBtn = document.getElementById('brush-undo-btn');

  const autoDetectBtn = document.getElementById('auto-detect-btn');
  const autoRemoveBtn = document.getElementById('auto-remove-btn');

  const algorithmSelect = document.getElementById('algorithm-select');
  const fpsSelect = document.getElementById('fps-select');
  const temporalSmoothingCheck = document.getElementById('temporal-smoothing-check');

  const applyInpaintBtn = document.getElementById('apply-inpaint-btn');
  const downloadBtn = document.getElementById('download-btn');

  // Application State
  let selectionController = null;
  let activeProcess = null;
  let currentFileName = 'sample-video.webm';
  let isOverlayHidden = false;
  let isScrubbing = false;
  let wasPlayingBeforeScrub = false;
  let processedBlob = null;
  let processedUrl = null;

  // Format seconds to MM:SS
  function formatTime(sec) {
    if (!isFinite(sec) || isNaN(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // 1. File Handling & Sample Loading
  browseBtn.addEventListener('click', () => { fileInput.value = ''; fileInput.click(); });
  dropZone.addEventListener('click', (e) => {
    if (e.target !== browseBtn && e.target !== sampleBtn) {
      fileInput.value = '';
      fileInput.click();
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) loadFile(e.target.files[0]);
  });

  changeVideoBtn.addEventListener('click', () => { fileInput.value = ''; fileInput.click(); });

  function loadFile(file) {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      alert('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }
    currentFileName = file.name;
    const url = URL.createObjectURL(file);
    setupVideoSource(url, currentFileName);
  }

  async function loadSampleVideo() {
    statusIndicator.textContent = 'Generating synthetic sample video...';
    try {
      const sample = await engine.generateSampleVideo(CONFIG.toolType, { width: 640, height: 360, duration: 2.5 });
      if (sample && sample.url) {
        currentFileName = 'sample-logo-video.webm';
        setupVideoSource(sample.url, currentFileName, sample.box);
      }
    } catch (err) {
      console.error('Failed to generate sample video:', err);
      statusIndicator.textContent = 'Error creating sample video.';
    }
  }
  sampleBtn.addEventListener('click', loadSampleVideo);

  function setupVideoSource(url, fileName, customBox = null) {
    sourceVideo.pause();
    sourceVideo.src = url;
    sourceVideo.loop = true;
    sourceVideo.muted = true; // Muted enables autoplay without user interaction block

    sourceVideo.onloadedmetadata = () => {
      const W = sourceVideo.videoWidth || 640;
      const H = sourceVideo.videoHeight || 360;
      const duration = sourceVideo.duration || 0;

      stageCanvas.width = W;
      stageCanvas.height = H;

      fileNameEl.textContent = fileName;
      videoDimsEl.textContent = `${W} × ${H} px`;
      videoDurationEl.textContent = formatTime(duration);
      durationTimeText.textContent = formatTime(duration);

      dropZone.style.display = 'none';
      infoStrip.style.display = 'flex';
      studioGrid.style.display = 'grid';
      downloadBtn.disabled = true;
      detectionBadge.style.display = 'none';

      // Initialize or rebuild Selection Controller
      if (selectionController) selectionController.destroy();

      const initialBoxNorm = customBox ? {
        x: customBox.x / W,
        y: customBox.y / H,
        w: customBox.w / W,
        h: customBox.h / H
      } : CONFIG.initialBox;

      selectionController = engine.createSelectionController(videoStageWrapper, {
        mode: CONFIG.defaultMode,
        brushSize: parseInt(brushSizeSlider.value, 10),
        initialBox: initialBoxNorm
      });

      setMode(CONFIG.defaultMode);
      statusIndicator.textContent = 'Video loaded. Adjust selection or click Auto-Detect.';

      sourceVideo.play().catch(() => {});
    };
  }

  // 2. Playback Synchronization
  function togglePlayPause() {
    if (sourceVideo.paused || sourceVideo.ended) {
      sourceVideo.play().catch(() => {});
    } else {
      sourceVideo.pause();
    }
  }
  playPauseBtn.addEventListener('click', togglePlayPause);

  sourceVideo.addEventListener('play', () => {
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
  });
  sourceVideo.addEventListener('pause', () => {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
  });

  sourceVideo.addEventListener('timeupdate', () => {
    if (isScrubbing) return;
    const curr = sourceVideo.currentTime;
    const dur = sourceVideo.duration || 1;
    timelineSlider.value = (curr / dur) * 1000;
    currentTimeText.textContent = formatTime(curr);
  });

  timelineSlider.addEventListener('input', () => {
    if (!isScrubbing) {
      isScrubbing = true;
      wasPlayingBeforeScrub = !sourceVideo.paused;
      sourceVideo.pause();
    }
    const target = (timelineSlider.value / 1000) * (sourceVideo.duration || 1);
    sourceVideo.currentTime = target;
    currentTimeText.textContent = formatTime(target);
  });

  timelineSlider.addEventListener('change', () => {
    isScrubbing = false;
    if (wasPlayingBeforeScrub) sourceVideo.play().catch(() => {});
  });

  stepBackBtn.addEventListener('click', () => {
    sourceVideo.pause();
    const fps = Number(fpsSelect.value) || 30;
    sourceVideo.currentTime = Math.max(0, sourceVideo.currentTime - (1 / fps));
  });

  stepForwardBtn.addEventListener('click', () => {
    sourceVideo.pause();
    const fps = Number(fpsSelect.value) || 30;
    sourceVideo.currentTime = Math.min(sourceVideo.duration, sourceVideo.currentTime + (1 / fps));
  });

  muteBtn.addEventListener('click', () => {
    sourceVideo.muted = !sourceVideo.muted;
    iconVolume.style.display = sourceVideo.muted ? 'none' : 'block';
    iconMuted.style.display = sourceVideo.muted ? 'block' : 'none';
  });

  volumeSlider.addEventListener('input', () => {
    sourceVideo.volume = parseFloat(volumeSlider.value);
    sourceVideo.muted = sourceVideo.volume === 0;
    iconVolume.style.display = sourceVideo.muted ? 'none' : 'block';
    iconMuted.style.display = sourceVideo.muted ? 'block' : 'none';
  });

  loopToggleBtn.addEventListener('click', () => {
    sourceVideo.loop = !sourceVideo.loop;
    loopToggleBtn.classList.toggle('active', sourceVideo.loop);
  });

  // 3. Selection Mode Toggles
  function setMode(mode) {
    if (!selectionController) return;
    selectionController.setMode(mode);
    if (mode === 'box') {
      modeBoxBtn.classList.add('active');
      modeBrushBtn.classList.remove('active');
      brushControls.style.display = 'none';
    } else {
      modeBoxBtn.classList.remove('active');
      modeBrushBtn.classList.add('active');
      brushControls.style.display = 'block';
    }
  }
  modeBoxBtn.addEventListener('click', () => setMode('box'));
  modeBrushBtn.addEventListener('click', () => setMode('brush'));

  brushSizeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    brushSizeVal.textContent = `${val}px`;
    if (selectionController) selectionController.setBrushSize(val);
  });

  brushEraserBtn.addEventListener('click', () => {
    if (!selectionController) return;
    const isE = !selectionController.isEraser();
    selectionController.setEraser(isE);
    brushEraserBtn.classList.toggle('active', isE);
    brushEraserBtn.textContent = isE ? 'Draw Mode' : 'Eraser Mode';
  });

  brushUndoBtn.addEventListener('click', () => {
    if (selectionController) selectionController.undo();
  });

  clearSelectionBtn.addEventListener('click', () => {
    if (selectionController) selectionController.clear();
    detectionBadge.style.display = 'none';
    statusIndicator.textContent = 'Selection cleared';
  });

  resetVideoBtn.addEventListener('click', () => {
    if (selectionController) {
      selectionController.setBoundingBox(CONFIG.initialBox);
      detectionBadge.style.display = 'none';
      statusIndicator.textContent = 'Reset to default selection box';
    }
  });

  // Compare Button: Toggle Overlay Visibility
  compareBtn.addEventListener('click', () => {
    const overlays = videoStageWrapper.querySelectorAll('.selection-overlay-canvas, .selection-cursor-canvas');
    isOverlayHidden = !isOverlayHidden;
    overlays.forEach(el => el.style.visibility = isOverlayHidden ? 'hidden' : 'visible');
    compareBtn.classList.toggle('active', isOverlayHidden);
    statusIndicator.textContent = isOverlayHidden ? 'Mask hidden for comparison' : 'Mask visible';
  });

  // 4. Auto-Detection on Current Frame
  function runAutoDetection() {
    if (!sourceVideo || !stageCanvas) return null;
    const W = sourceVideo.videoWidth || 640;
    const H = sourceVideo.videoHeight || 360;
    stageCtx.drawImage(sourceVideo, 0, 0, W, H);
    const frameData = stageCtx.getImageData(0, 0, W, H);

    const candidates = CONFIG.detectFn(frameData);

    if (candidates && candidates.length > 0) {
      candidates.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
      const best = candidates[0];
      const normBox = {
        x: best.x / W,
        y: best.y / H,
        w: best.w / W,
        h: best.h / H
      };
      setMode('box');
      selectionController.setBoundingBox(normBox);
      detectionBadge.style.display = 'inline-flex';
      detectionBadge.textContent = `${CONFIG.toolTitle} Auto-Detected`;
      statusIndicator.textContent = `Auto-detected ${CONFIG.toolTitle.toLowerCase()} region (${Math.round(best.w)} × ${Math.round(best.h)} px)`;
      return normBox;
    } else {
      statusIndicator.textContent = `No obvious ${CONFIG.toolTitle.toLowerCase()} auto-detected on this frame. Please select manually.`;
      return null;
    }
  }

  autoDetectBtn.addEventListener('click', runAutoDetection);
  autoRemoveBtn.addEventListener('click', () => {
    runAutoDetection();
    startProcessing();
  });

  // 5. Video Processing Pipeline Execution
  function startProcessing() {
    if (!selectionController || !sourceVideo) return;
    sourceVideo.pause();

    const W = sourceVideo.videoWidth || 640;
    const H = sourceVideo.videoHeight || 360;
    const curMode = selectionController.getMode ? selectionController.getMode() : 'box';

    let regionBox = null;
    let binaryMask = null;

    if (curMode === 'box') {
      regionBox = selectionController.getBoundingBox(W, H);
      if (!regionBox || regionBox.w <= 2 || regionBox.h <= 2) {
        alert('Please draw or adjust the selection box over the logo first.');
        return;
      }
    } else {
      binaryMask = selectionController.getBinaryMask(W, H);
      regionBox = selectionController.getBoundingBox(W, H);
    }

    const algorithm = algorithmSelect.value || CONFIG.defaultAlgorithm;
    const fps = Number(fpsSelect.value) || 30;
    const temporalSmoothing = temporalSmoothingCheck.checked;

    // Show processing overlay
    processOverlay.style.display = 'flex';
    progressBarFill.style.width = '0%';
    processStatus.textContent = 'Inpainting video frames...';
    processFrameInfo.textContent = 'Initializing pipeline...';
    processTimeInfo.textContent = '00:00 / 00:00';
    applyInpaintBtn.disabled = true;
    downloadBtn.disabled = true;
    statusIndicator.textContent = 'Processing video frames...';

    const renderCanvas = document.createElement('canvas');

    activeProcess = engine.processVideo({
      videoElement: sourceVideo,
      renderCanvas,
      region: regionBox,
      mask: binaryMask,
      algorithm,
      fps,
      temporalSmoothing,
      onProgress: ({ currentFrame, totalFrames, percent, currentTime, duration }) => {
        progressBarFill.style.width = `${percent}%`;
        processFrameInfo.textContent = `Frame ${currentFrame} / ${totalFrames} (${percent}%)`;
        processTimeInfo.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
      },
      onComplete: ({ blob, url }) => {
        processOverlay.style.display = 'none';
        applyInpaintBtn.disabled = false;
        downloadBtn.disabled = false;
        processedBlob = blob;
        processedUrl = url;

        const sizeMb = (blob.size / (1024 * 1024)).toFixed(1);
        statusIndicator.textContent = `Processing complete! ${sizeMb} MB generated.`;
        downloadBtn.textContent = `Download Clean Video (${sizeMb} MB)`;

        // Play the clean video in place
        sourceVideo.src = url;
        sourceVideo.currentTime = 0;
        sourceVideo.play().catch(() => {});
      },
      onError: (err) => {
        processOverlay.style.display = 'none';
        applyInpaintBtn.disabled = false;
        console.error('Video processing error:', err);
        statusIndicator.textContent = `Processing error: ${err.message || 'Check console'}`;
        alert(`Video processing failed: ${err.message || 'Error occurred'}`);
      }
    });
  }

  applyInpaintBtn.addEventListener('click', startProcessing);

  cancelProcessBtn.addEventListener('click', () => {
    if (activeProcess) {
      activeProcess.cancel();
      processOverlay.style.display = 'none';
      applyInpaintBtn.disabled = false;
      statusIndicator.textContent = 'Video processing cancelled';
    }
  });

  // Download Trigger
  downloadBtn.addEventListener('click', () => {
    if (!processedUrl || !processedBlob) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const ext = processedBlob.type && processedBlob.type.includes('mp4') ? 'mp4' : 'webm';
    a.download = currentFileName.replace(/\.[^/.]+$/, '') + '-clean.' + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // Keyboard Shortcuts (Spacebar = Play/Pause, ArrowLeft/Right = Step Frame)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      stepBackBtn.click();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      stepForwardBtn.click();
    }
  });
});
