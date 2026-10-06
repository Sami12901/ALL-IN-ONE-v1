// Screen Recorder Studio Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Config
  const optSystemAudio = document.getElementById('opt-system-audio');
  const optMicAudio = document.getElementById('opt-mic-audio');
  const optEnablePip = document.getElementById('opt-enable-pip');
  const pipOptionsBox = document.getElementById('pip-options-box');
  const pipPosition = document.getElementById('pip-position');
  const pipShape = document.getElementById('pip-shape');
  const optResolution = document.getElementById('opt-resolution');
  const codecLabel = document.getElementById('codec-label');

  // DOM Elements - Live Controls
  const statusBadge = document.getElementById('status-badge');
  const statusText = document.getElementById('status-text');
  const timerDisplay = document.getElementById('timer-display');
  const btnStartRecord = document.getElementById('btn-start-record');
  const btnPauseRecord = document.getElementById('btn-pause-record');
  const pauseIcon = document.getElementById('pause-icon');
  const pauseText = document.getElementById('pause-text');
  const btnStopRecord = document.getElementById('btn-stop-record');

  // DOM Elements - Audio Meter
  const audioMeterPanel = document.getElementById('audio-meter-panel');
  const audioMeterBar = document.getElementById('audio-meter-bar');
  const audioActiveLabel = document.getElementById('audio-active-label');

  // DOM Elements - Live Monitor Stage
  const liveStageFrame = document.getElementById('live-stage-frame');
  const stagePlaceholder = document.getElementById('stage-placeholder');
  const liveVideoElement = document.getElementById('live-video-element');
  const cameraPipWrap = document.getElementById('camera-pip-wrap');
  const liveCameraElement = document.getElementById('live-camera-element');
  const streamDimensions = document.getElementById('stream-dimensions');

  // DOM Elements - Playback & Export
  const playbackCard = document.getElementById('playback-card');
  const playbackVideoElement = document.getElementById('playback-video-element');
  const statDuration = document.getElementById('stat-duration');
  const statSize = document.getElementById('stat-size');
  const statRes = document.getElementById('stat-res');
  const btnRecordAgain = document.getElementById('btn-record-again');
  const btnDownloadRecording = document.getElementById('btn-download-recording');

  // Offscreen Compositor Canvas for Camera PiP
  const compositorCanvas = document.getElementById('pip-compositor-canvas');
  const compositorCtx = compositorCanvas.getContext('2d');

  // State Variables
  let displayStream = null;
  let micStream = null;
  let cameraStream = null;
  let combinedStream = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let recordedBlob = null;
  let recordedUrl = null;

  let recordingState = 'idle'; // 'idle', 'recording', 'paused', 'completed'
  let startTime = 0;
  let pausedAccumulated = 0;
  let pauseStartTime = 0;
  let timerInterval = null;

  let audioContext = null;
  let audioAnalyser = null;
  let audioDataArray = null;
  let audioAnimFrame = null;
  let pipAnimFrame = null;
  let selectedMimeType = '';

  // Determine Best Supported Video Codec
  function detectBestCodec() {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4'
    ];
    for (const type of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        selectedMimeType = type;
        break;
      }
    }
    if (codecLabel) {
      if (selectedMimeType.includes('vp9')) {
        codecLabel.textContent = 'WebM (VP9 High Quality)';
      } else if (selectedMimeType.includes('vp8')) {
        codecLabel.textContent = 'WebM (VP8 Standard)';
      } else if (selectedMimeType.includes('mp4')) {
        codecLabel.textContent = 'MP4 Video';
      } else {
        codecLabel.textContent = 'WebM Video';
      }
    }
  }
  detectBestCodec();

  // PiP Controls UI Sync
  optEnablePip.addEventListener('change', () => {
    pipOptionsBox.style.display = optEnablePip.checked ? 'flex' : 'none';
    syncPipClasses();
  });

  function syncPipClasses() {
    cameraPipWrap.className = `camera-pip-overlay ${pipPosition.value} ${pipShape.value}`;
  }

  pipPosition.addEventListener('change', syncPipClasses);
  pipShape.addEventListener('change', syncPipClasses);

  // Time & Clock Formatter
  function formatClock(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Update Status Badge UI
  function updateStatus(state) {
    recordingState = state;
    statusBadge.className = 'rec-status-indicator';
    if (state === 'recording') {
      statusBadge.classList.add('recording');
      statusText.textContent = 'Recording';
      btnStartRecord.disabled = true;
      btnPauseRecord.disabled = false;
      btnStopRecord.disabled = false;
      pauseIcon.innerHTML = '&#10074;&#10074;';
      pauseText.textContent = 'Pause';
    } else if (state === 'paused') {
      statusBadge.classList.add('paused');
      statusText.textContent = 'Paused';
      pauseIcon.innerHTML = '&#9658;';
      pauseText.textContent = 'Resume';
    } else if (state === 'completed') {
      statusBadge.classList.add('completed');
      statusText.textContent = 'Finished';
      btnStartRecord.disabled = false;
      btnPauseRecord.disabled = true;
      btnStopRecord.disabled = true;
    } else {
      // idle
      statusText.textContent = 'Standby';
      btnStartRecord.disabled = false;
      btnPauseRecord.disabled = true;
      btnStopRecord.disabled = true;
    }
  }

  // Start Recording Clock Timer
  function startTimer() {
    startTime = performance.now();
    pausedAccumulated = 0;
    pauseStartTime = 0;
    timerDisplay.textContent = '00:00:00';

    timerInterval = setInterval(() => {
      if (recordingState === 'recording') {
        const elapsed = performance.now() - startTime - pausedAccumulated;
        timerDisplay.textContent = formatClock(elapsed);
      }
    }, 250);
  }

  function pauseTimer() {
    pauseStartTime = performance.now();
  }

  function resumeTimer() {
    if (pauseStartTime > 0) {
      pausedAccumulated += performance.now() - pauseStartTime;
      pauseStartTime = 0;
    }
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Live Audio Level Visualizer
  function startAudioVisualizer(analyser) {
    audioMeterPanel.style.display = 'flex';
    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    audioDataArray = new Uint8Array(bufferLength);

    function renderAudioFrame() {
      if (recordingState !== 'recording' && recordingState !== 'paused') return;
      analyser.getByteFrequencyData(audioDataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += audioDataArray[i];
      }
      const avg = sum / bufferLength;
      const percent = Math.min(100, Math.round((avg / 128) * 100));
      audioMeterBar.style.width = `${percent}%`;
      audioActiveLabel.textContent = `${percent}%`;
      audioAnimFrame = requestAnimationFrame(renderAudioFrame);
    }
    renderAudioFrame();
  }

  function stopAudioVisualizer() {
    if (audioAnimFrame) cancelAnimationFrame(audioAnimFrame);
    audioMeterPanel.style.display = 'none';
    audioMeterBar.style.width = '0%';
    audioActiveLabel.textContent = '0%';
  }

  // Canvas Compositor for Camera PiP into Recorded Video
  function startPipCompositor(videoTrack, camTrack) {
    const isCircle = pipShape.value === 'shape-circle';
    const pos = pipPosition.value;

    function renderPipCompositor() {
      if (recordingState !== 'recording' && recordingState !== 'paused') return;

      const cw = compositorCanvas.width;
      const ch = compositorCanvas.height;

      // 1. Draw screen video
      if (liveVideoElement.readyState >= 2) {
        compositorCtx.drawImage(liveVideoElement, 0, 0, cw, ch);
      } else {
        compositorCtx.fillStyle = '#000000';
        compositorCtx.fillRect(0, 0, cw, ch);
      }

      // 2. Draw Camera overlay if active
      if (optEnablePip.checked && liveCameraElement.readyState >= 2) {
        compositorCtx.save();
        let pipW = isCircle ? 240 : 340;
        let pipH = isCircle ? 240 : 190;
        let margin = 40;
        let px = cw - pipW - margin;
        let py = ch - pipH - margin;

        if (pos === 'pos-bottom-left') {
          px = margin;
          py = ch - pipH - margin;
        } else if (pos === 'pos-top-right') {
          px = cw - pipW - margin;
          py = margin;
        } else if (pos === 'pos-top-left') {
          px = margin;
          py = margin;
        }

        // Clip region
        compositorCtx.beginPath();
        if (isCircle) {
          const radius = pipW / 2;
          compositorCtx.arc(px + radius, py + radius, radius, 0, Math.PI * 2);
        } else {
          const r = 20;
          compositorCtx.moveTo(px + r, py);
          compositorCtx.lineTo(px + pipW - r, py);
          compositorCtx.quadraticCurveTo(px + pipW, py, px + pipW, py + r);
          compositorCtx.lineTo(px + pipW, py + pipH - r);
          compositorCtx.quadraticCurveTo(px + pipW, py + pipH, px + pipW - r, py + pipH);
          compositorCtx.lineTo(px + r, py + pipH);
          compositorCtx.quadraticCurveTo(px, py + pipH, px, py + pipH - r);
          compositorCtx.lineTo(px, py + r);
          compositorCtx.quadraticCurveTo(px, py, px + r, py);
        }
        compositorCtx.closePath();
        compositorCtx.clip();

        // Draw camera mirrored
        compositorCtx.save();
        compositorCtx.translate(px + pipW, py);
        compositorCtx.scale(-1, 1);
        compositorCtx.drawImage(liveCameraElement, 0, 0, pipW, pipH);
        compositorCtx.restore();

        // Border stroke
        compositorCtx.restore();
        compositorCtx.save();
        compositorCtx.beginPath();
        if (isCircle) {
          compositorCtx.arc(px + pipW / 2, py + pipH / 2, pipW / 2, 0, Math.PI * 2);
        } else {
          const r = 20;
          compositorCtx.moveTo(px + r, py);
          compositorCtx.lineTo(px + pipW - r, py);
          compositorCtx.quadraticCurveTo(px + pipW, py, px + pipW, py + r);
          compositorCtx.lineTo(px + pipW, py + pipH - r);
          compositorCtx.quadraticCurveTo(px + pipW, py + pipH, px + pipW - r, py + pipH);
          compositorCtx.lineTo(px + r, py + pipH);
          compositorCtx.quadraticCurveTo(px, py + pipH, px, py + pipH - r);
          compositorCtx.lineTo(px, py + r);
          compositorCtx.quadraticCurveTo(px, py, px + r, py);
        }
        compositorCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        compositorCtx.lineWidth = 4;
        compositorCtx.stroke();
        compositorCtx.restore();
      }

      pipAnimFrame = requestAnimationFrame(renderPipCompositor);
    }

    renderPipCompositor();
  }

  // START RECORDING HANDLER
  async function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert('Your browser does not support the Screen Recording API (navigator.mediaDevices.getDisplayMedia). Please use Chrome, Edge, Firefox, or Safari on desktop.');
      return;
    }

    try {
      // 1. Determine Resolution & FPS
      const resVal = optResolution.value;
      let targetW = 1920, targetH = 1080, targetFps = 60;
      if (resVal === '1080p-30') {
        targetFps = 30;
      } else if (resVal === '720p-30') {
        targetW = 1280;
        targetH = 720;
        targetFps = 30;
      }

      compositorCanvas.width = targetW;
      compositorCanvas.height = targetH;

      // 2. Request Display Stream
      const displayConstraints = {
        video: {
          width: { ideal: targetW },
          height: { ideal: targetH },
          frameRate: { ideal: targetFps }
        },
        audio: optSystemAudio.checked
      };

      displayStream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);

      // Handle user stopping stream from browser floating bar
      displayStream.getVideoTracks()[0].onended = () => {
        if (recordingState === 'recording' || recordingState === 'paused') {
          stopRecording();
        }
      };

      // 3. Request Camera Stream if PiP is enabled
      if (optEnablePip.checked) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 360 },
              frameRate: { ideal: 30 }
            }
          });
          liveCameraElement.srcObject = cameraStream;
          cameraPipWrap.classList.add('active');
        } catch (camErr) {
          console.warn('Camera access was not granted for PiP:', camErr);
          cameraPipWrap.classList.remove('active');
        }
      }

      // 4. Request Mic Stream if checked
      if (optMicAudio.checked) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true }
          });
        } catch (micErr) {
          console.warn('Microphone access was not granted:', micErr);
        }
      }

      // 5. Mixed Audio via Web Audio API
      let finalAudioTrack = null;
      const hasDisplayAudio = displayStream.getAudioTracks().length > 0;
      const hasMicAudio = micStream && micStream.getAudioTracks().length > 0;

      if (hasDisplayAudio || hasMicAudio) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioContext.createMediaStreamDestination();
        audioAnalyser = audioContext.createAnalyser();

        if (hasDisplayAudio) {
          const dispSrc = audioContext.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks()));
          dispSrc.connect(dest);
          dispSrc.connect(audioAnalyser);
        }
        if (hasMicAudio) {
          const micSrc = audioContext.createMediaStreamSource(new MediaStream(micStream.getAudioTracks()));
          micSrc.connect(dest);
          micSrc.connect(audioAnalyser);
        }

        finalAudioTrack = dest.stream.getAudioTracks()[0];
        startAudioVisualizer(audioAnalyser);
      }

      // 6. Connect Live Preview Video Element
      liveVideoElement.srcObject = displayStream;
      liveVideoElement.style.display = 'block';
      stagePlaceholder.style.display = 'none';
      playbackCard.style.display = 'none';
      liveStageFrame.style.display = 'flex';

      const vTrack = displayStream.getVideoTracks()[0];
      const settings = vTrack.getSettings ? vTrack.getSettings() : {};
      streamDimensions.textContent = `${settings.width || targetW} × ${settings.height || targetH} @ ${settings.frameRate || targetFps}fps`;

      // 7. Video track to record
      let recordedVideoTrack = null;
      if (optEnablePip.checked && cameraStream) {
        startPipCompositor(vTrack, cameraStream.getVideoTracks()[0]);
        const canvasStream = compositorCanvas.captureStream(targetFps);
        recordedVideoTrack = canvasStream.getVideoTracks()[0];
      } else {
        recordedVideoTrack = vTrack;
      }

      // 8. Combine into Record Stream
      const streamTracks = [recordedVideoTrack];
      if (finalAudioTrack) {
        streamTracks.push(finalAudioTrack);
      }
      combinedStream = new MediaStream(streamTracks);

      // 9. Initialize MediaRecorder
      recordedChunks = [];
      const mrOptions = selectedMimeType ? { mimeType: selectedMimeType, videoBitsPerSecond: 8000000 } : {};
      mediaRecorder = new MediaRecorder(combinedStream, mrOptions);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStopped;

      mediaRecorder.start(1000); // 1-second chunks for resilient recording
      updateStatus('recording');
      startTimer();

    } catch (err) {
      console.warn('Recording canceled or failed:', err);
      cleanupStreams();
      updateStatus('idle');
      stagePlaceholder.style.display = 'flex';
      liveVideoElement.style.display = 'none';
      cameraPipWrap.classList.remove('active');
    }
  }

  // PAUSE / RESUME HANDLER
  function togglePause() {
    if (!mediaRecorder) return;
    if (recordingState === 'recording') {
      mediaRecorder.pause();
      pauseTimer();
      updateStatus('paused');
    } else if (recordingState === 'paused') {
      mediaRecorder.resume();
      resumeTimer();
      updateStatus('recording');
    }
  }

  // STOP RECORDING HANDLER
  function stopRecording() {
    if (!mediaRecorder || recordingState === 'idle' || recordingState === 'completed') return;
    updateStatus('completed');
    stopTimer();
    stopAudioVisualizer();

    if (pipAnimFrame) cancelAnimationFrame(pipAnimFrame);

    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    cleanupStreams();
  }

  // Cleanup active device tracks
  function cleanupStreams() {
    if (displayStream) {
      displayStream.getTracks().forEach(t => t.stop());
      displayStream = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
    cameraPipWrap.classList.remove('active');
  }

  // Handled when MediaRecorder finishes writing
  function handleRecordingStopped() {
    const finalMime = selectedMimeType || 'video/webm';
    recordedBlob = new Blob(recordedChunks, { type: finalMime });
    
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    recordedUrl = URL.createObjectURL(recordedBlob);

    // Setup Playback Player
    playbackVideoElement.src = recordedUrl;
    playbackVideoElement.load();

    // Stats
    const totalElapsed = (performance.now() - startTime - pausedAccumulated);
    statDuration.textContent = formatClock(totalElapsed);
    const sizeInMB = (recordedBlob.size / (1024 * 1024)).toFixed(2);
    statSize.textContent = `${sizeInMB} MB`;
    statRes.textContent = streamDimensions.textContent.split('@')[0].trim() || '1920×1080';

    // Show playback card & switch stages
    liveStageFrame.style.display = 'none';
    playbackCard.style.display = 'flex';
  }

  // DOWNLOAD SCREEN RECORDING
  function downloadRecording() {
    if (!recordedBlob || !recordedUrl) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
    const filename = `screen-recording-${dateStr}-${timeStr}.webm`;

    const a = document.createElement('a');
    a.href = recordedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // RECORD AGAIN / RESET
  function resetStudio() {
    playbackVideoElement.pause();
    playbackVideoElement.removeAttribute('src');
    playbackVideoElement.load();

    playbackCard.style.display = 'none';
    liveStageFrame.style.display = 'flex';
    liveVideoElement.style.display = 'none';
    stagePlaceholder.style.display = 'flex';
    cameraPipWrap.classList.remove('active');
    streamDimensions.textContent = 'Ready to capture';
    timerDisplay.textContent = '00:00:00';
    updateStatus('idle');
  }

  // Event Listeners
  btnStartRecord.addEventListener('click', startRecording);
  btnPauseRecord.addEventListener('click', togglePause);
  btnStopRecord.addEventListener('click', stopRecording);
  btnDownloadRecording.addEventListener('click', downloadRecording);
  btnRecordAgain.addEventListener('click', resetStudio);
});