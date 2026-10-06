// Voice Audio Recorder Studio - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const recordBtn = document.getElementById('recordBtn');
  const recordBtnText = document.getElementById('recordBtnText');
  const recordIcon = document.getElementById('recordIcon');
  const pauseBtn = document.getElementById('pauseBtn');
  const pauseBtnText = document.getElementById('pauseBtnText');
  const stopBtn = document.getElementById('stopBtn');
  const resetBtn = document.getElementById('resetBtn');

  const statusBadge = document.getElementById('recordingStatusBadge');
  const statusText = document.getElementById('recordingStatusText');
  const timerDisplay = document.getElementById('timerDisplay');
  const canvas = document.getElementById('visualizerCanvas');
  const canvasCtx = canvas.getContext('2d');

  const micSelect = document.getElementById('micSelect');
  const formatSelect = document.getElementById('formatSelect');
  const noiseSuppressionToggle = document.getElementById('noiseSuppressionToggle');

  const playbackPanel = document.getElementById('playbackPanel');
  const audioPlayer = document.getElementById('audioPlayer');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');
  const speedSelect = document.getElementById('speedSelect');

  const trimStart = document.getElementById('trimStart');
  const trimEnd = document.getElementById('trimEnd');
  const applyTrimBtn = document.getElementById('applyTrimBtn');
  const resetTrimBtn = document.getElementById('resetTrimBtn');

  const downloadWebmBtn = document.getElementById('downloadWebmBtn');
  const downloadWavBtn = document.getElementById('downloadWavBtn');
  const saveSessionBtn = document.getElementById('saveSessionBtn');

  const recordingsList = document.getElementById('recordingsList');
  const recordingCount = document.getElementById('recordingCount');
  const clearLibraryBtn = document.getElementById('clearLibraryBtn');
  const emptyLibraryNotice = document.getElementById('emptyLibraryNotice');

  // State Variables
  let mediaStream = null;
  let mediaRecorder = null;
  let audioContext = null;
  let analyserNode = null;
  let sourceNode = null;
  let animationFrameId = null;

  let recordedChunks = [];
  let isRecording = false;
  let isPaused = false;
  let startTime = 0;
  let pausedTime = 0;
  let pauseStart = 0;
  let timerInterval = null;
  let recordedDurationSec = 0;

  let currentBlobWebm = null;
  let currentAudioBuffer = null;
  let trimmedBuffer = null;
  let currentAudioUrl = null;

  const sessionLibrary = [];

  // Helper: Format Seconds to MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Populate Microphones
  async function initMicrophones() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      if (audioInputs.length > 0 && audioInputs[0].label) {
        micSelect.innerHTML = '';
        audioInputs.forEach((dev, index) => {
          const opt = document.createElement('option');
          opt.value = dev.deviceId;
          opt.textContent = dev.label || `Microphone ${index + 1}`;
          micSelect.appendChild(opt);
        });
      }
    } catch {
      // Permission might be requested during recording start
    }
  }
  initMicrophones();

  // Resize canvas according to display width
  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Audio Visualizer Loop
  function startVisualizer() {
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animationFrameId = requestAnimationFrame(draw);
      const width = canvas.width;
      const height = canvas.height;

      canvasCtx.clearRect(0, 0, width, height);

      // Gradient background subtle glow
      canvasCtx.fillStyle = 'rgba(10, 15, 25, 0.4)';
      canvasCtx.fillRect(0, 0, width, height);

      if (!isRecording && !isPaused) {
        // Idle gentle waveform
        const t = performance.now() * 0.003;
        canvasCtx.lineWidth = 2 * (window.devicePixelRatio || 1);
        canvasCtx.strokeStyle = 'rgba(137, 170, 204, 0.35)';
        canvasCtx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.02 + t) * (height * 0.08);
          if (x === 0) canvasCtx.moveTo(x, y);
          else canvasCtx.lineTo(x, y);
        }
        canvasCtx.stroke();
        return;
      }

      if (isPaused) {
        // Flat pause line
        canvasCtx.lineWidth = 2 * (window.devicePixelRatio || 1);
        canvasCtx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, height / 2);
        canvasCtx.lineTo(width, height / 2);
        canvasCtx.stroke();
        return;
      }

      analyserNode.getByteFrequencyData(dataArray);

      // Draw frequency spectrum bars
      const barCount = Math.min(bufferLength, 48);
      const barWidth = (width / barCount) * 0.7;
      const barSpacing = (width / barCount) * 0.3;

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i];
        const percent = value / 255;
        const barHeight = Math.max(4, percent * height * 0.85);
        const x = i * (barWidth + barSpacing) + barSpacing / 2;
        const y = (height - barHeight) / 2;

        const grad = canvasCtx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#89aacc');
        grad.addColorStop(1, '#4e85bf');

        canvasCtx.fillStyle = grad;
        canvasCtx.beginPath();
        if (canvasCtx.roundRect) {
          canvasCtx.roundRect(x, y, barWidth, barHeight, 4);
        } else {
          canvasCtx.rect(x, y, barWidth, barHeight);
        }
        canvasCtx.fill();
      }
    }

    draw();
  }

  // Draw idle visualizer initially
  startVisualizer();

  // Timer Tick
  function updateTimer() {
    if (!isRecording || isPaused) return;
    const elapsed = (Date.now() - startTime - pausedTime) / 1000;
    recordedDurationSec = elapsed;
    timerDisplay.textContent = formatTime(elapsed);
  }

  // WAV Encoder Helper (Pure Client-side 16-bit PCM)
  function audioBufferToWav(buffer, optStartSec = 0, optEndSec = null) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const startOffset = Math.floor(Math.max(0, optStartSec) * sampleRate);
    const endOffset = optEndSec !== null 
      ? Math.min(Math.floor(optEndSec * sampleRate), buffer.length) 
      : buffer.length;
    const length = Math.max(0, endOffset - startOffset);
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    function writeString(v, offset, string) {
      for (let i = 0; i < string.length; i++) {
        v.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // 16-bit
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = buffer.getChannelData(ch)[startOffset + i];
        const s = Math.max(-1, Math.min(1, sample));
        const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
        view.setInt16(offset, val, true);
        offset += 2;
      }
    }
    return new Blob([view], { type: 'audio/wav' });
  }

  // Update Status UI
  function setStatus(state, message) {
    statusBadge.className = `status-badge ${state}`;
    statusText.textContent = message;
  }

  // Start Recording
  async function startRecording() {
    try {
      recordedChunks = [];
      const constraints = {
        audio: {
          deviceId: micSelect.value !== 'default' ? { exact: micSelect.value } : undefined,
          echoCancellation: noiseSuppressionToggle.checked,
          noiseSuppression: noiseSuppressionToggle.checked
        }
      };

      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      initMicrophones(); // refresh device list with labels

      // Setup Web Audio API
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 128;
      sourceNode = audioContext.createMediaStreamSource(mediaStream);
      sourceNode.connect(analyserNode);

      // Detect supported mimeType
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStopped;

      mediaRecorder.start(250); // Slice every 250ms
      isRecording = true;
      isPaused = false;
      startTime = Date.now();
      pausedTime = 0;
      timerInterval = setInterval(updateTimer, 100);

      // UI updates
      setStatus('recording', 'Recording in Progress');
      recordBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      pauseBtnText.textContent = 'Pause';
      recordBtnText.textContent = 'Recording...';
    } catch (err) {
      console.error('Audio recording failed to start:', err);
      setStatus('ready', 'Microphone Access Denied');
      alert('Could not access microphone. Please allow microphone permissions in your browser to record audio.');
    }
  }

  // Pause / Resume Recording
  function togglePause() {
    if (!mediaRecorder || !isRecording) return;

    if (!isPaused) {
      mediaRecorder.pause();
      isPaused = true;
      pauseStart = Date.now();
      pauseBtnText.textContent = 'Resume';
      setStatus('paused', 'Recording Paused');
    } else {
      mediaRecorder.resume();
      isPaused = false;
      pausedTime += (Date.now() - pauseStart);
      pauseBtnText.textContent = 'Pause';
      setStatus('recording', 'Recording in Progress');
    }
  }

  // Stop Recording
  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    clearInterval(timerInterval);
    isRecording = false;
    isPaused = false;

    recordBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    recordBtnText.textContent = 'Record Again';
    setStatus('ready', 'Recording Completed');
  }

  // Handle Recording Stopped Event
  async function handleRecordingStopped() {
    const mimeType = mediaRecorder.mimeType || 'audio/webm';
    currentBlobWebm = new Blob(recordedChunks, { type: mimeType });

    // Decode Audio Buffer for playback, waveform & WAV conversion
    try {
      const arrayBuffer = await currentBlobWebm.arrayBuffer();
      const tempAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      currentAudioBuffer = await tempAudioCtx.decodeAudioData(arrayBuffer);
      trimmedBuffer = currentAudioBuffer;

      // Populate trim controls
      const totalSec = currentAudioBuffer.duration;
      trimStart.value = '0.0';
      trimStart.max = totalSec.toFixed(2);
      trimEnd.value = totalSec.toFixed(2);
      trimEnd.max = totalSec.toFixed(2);

      updateAudioPlayerBlob(currentBlobWebm);
      playbackPanel.style.display = 'block';
      playbackPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      console.warn('Direct decode failed, using WebM blob directly:', err);
      updateAudioPlayerBlob(currentBlobWebm);
      playbackPanel.style.display = 'block';
    }
  }

  // Update Audio Player source
  function updateAudioPlayerBlob(blob) {
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    currentAudioUrl = URL.createObjectURL(blob);
    audioPlayer.src = currentAudioUrl;
  }

  // Volume & Speed adjustments
  volumeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    volumeValue.textContent = `${val}%`;
    audioPlayer.volume = Math.min(1, val / 100);
  });

  speedSelect.addEventListener('change', (e) => {
    audioPlayer.playbackRate = parseFloat(e.target.value);
  });

  // Apply Trim
  applyTrimBtn.addEventListener('click', () => {
    if (!currentAudioBuffer) return;
    const start = parseFloat(trimStart.value) || 0;
    const end = parseFloat(trimEnd.value) || currentAudioBuffer.duration;

    if (start >= end) {
      alert('Start time must be less than end time.');
      return;
    }

    const trimmedWavBlob = audioBufferToWav(currentAudioBuffer, start, end);
    updateAudioPlayerBlob(trimmedWavBlob);
    audioPlayer.play().catch(() => {});
  });

  resetTrimBtn.addEventListener('click', () => {
    if (!currentAudioBuffer) return;
    trimStart.value = '0.0';
    trimEnd.value = currentAudioBuffer.duration.toFixed(2);
    updateAudioPlayerBlob(currentBlobWebm);
  });

  // Download WebM
  downloadWebmBtn.addEventListener('click', () => {
    if (!currentBlobWebm) return;
    const filename = `recording_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`;
    downloadBlob(currentBlobWebm, filename);
  });

  // Download WAV
  downloadWavBtn.addEventListener('click', () => {
    if (currentAudioBuffer) {
      const start = parseFloat(trimStart.value) || 0;
      const end = parseFloat(trimEnd.value) || currentAudioBuffer.duration;
      const wavBlob = audioBufferToWav(currentAudioBuffer, start, end);
      const filename = `recording_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.wav`;
      downloadBlob(wavBlob, filename);
    } else if (currentBlobWebm) {
      downloadBlob(currentBlobWebm, 'recording.webm');
    }
  });

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Save to Session Library
  saveSessionBtn.addEventListener('click', () => {
    if (!currentBlobWebm) return;
    const format = formatSelect.value;
    const now = new Date();
    const duration = formatTime(currentAudioBuffer ? currentAudioBuffer.duration : recordedDurationSec);
    const name = `Recording #${sessionLibrary.length + 1} (${now.toLocaleTimeString()})`;
    
    let blobToSave = currentBlobWebm;
    let ext = 'webm';
    if (format === 'wav' && currentAudioBuffer) {
      blobToSave = audioBufferToWav(currentAudioBuffer);
      ext = 'wav';
    }

    const item = {
      id: Date.now(),
      name,
      blob: blobToSave,
      ext,
      duration,
      size: `${(blobToSave.size / 1024).toFixed(1)} KB`,
      date: now.toLocaleTimeString()
    };

    sessionLibrary.unshift(item);
    renderLibrary();
  });

  function renderLibrary() {
    recordingCount.textContent = sessionLibrary.length;
    clearLibraryBtn.disabled = sessionLibrary.length === 0;

    if (sessionLibrary.length === 0) {
      recordingsList.innerHTML = '<p id="emptyLibraryNotice" style="color: var(--text-secondary); font-size: 0.9rem; text-align: center; padding: 1.5rem 0;">No recordings saved yet. Click "Start Recording" above to capture audio.</p>';
      return;
    }

    recordingsList.innerHTML = '';
    sessionLibrary.forEach((rec) => {
      const el = document.createElement('div');
      el.className = 'recording-item';
      el.innerHTML = `
        <div class="recording-meta">
          <span class="recording-title">${rec.name}</span>
          <div class="recording-info">
            <span>⏱ ${rec.duration}</span>
            <span>📦 ${rec.size}</span>
            <span>🎵 .${rec.ext}</span>
          </div>
        </div>
        <div class="recording-actions">
          <button class="btn btn-secondary btn-icon play-rec-btn" data-id="${rec.id}">▶ Play</button>
          <button class="btn btn-secondary btn-icon download-rec-btn" data-id="${rec.id}">↓ Download</button>
          <button class="btn btn-secondary btn-icon delete-rec-btn" data-id="${rec.id}" style="color: var(--error);">✕</button>
        </div>
      `;

      el.querySelector('.play-rec-btn').addEventListener('click', () => {
        updateAudioPlayerBlob(rec.blob);
        playbackPanel.style.display = 'block';
        audioPlayer.play().catch(() => {});
      });

      el.querySelector('.download-rec-btn').addEventListener('click', () => {
        downloadBlob(rec.blob, `${rec.name.replace(/[^a-zA-Z0-9]/g, '_')}.${rec.ext}`);
      });

      el.querySelector('.delete-rec-btn').addEventListener('click', () => {
        const idx = sessionLibrary.findIndex(r => r.id === rec.id);
        if (idx !== -1) {
          sessionLibrary.splice(idx, 1);
          renderLibrary();
        }
      });

      recordingsList.appendChild(el);
    });
  }

  clearLibraryBtn.addEventListener('click', () => {
    if (confirm('Clear all recordings in this session?')) {
      sessionLibrary.length = 0;
      renderLibrary();
    }
  });

  // Reset Session
  resetBtn.addEventListener('click', () => {
    if (isRecording) {
      stopRecording();
    }
    timerDisplay.textContent = '00:00';
    playbackPanel.style.display = 'none';
    setStatus('ready', 'Microphone Ready');
    recordBtn.disabled = false;
    recordBtnText.textContent = 'Start Recording';
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
  });

  // Event Listeners for main recording buttons
  recordBtn.addEventListener('click', () => {
    if (!isRecording) {
      startRecording();
    }
  });

  pauseBtn.addEventListener('click', togglePause);
  stopBtn.addEventListener('click', stopRecording);
});