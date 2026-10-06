// Voice & Microphone Audio Recorder Studio - ALL IN ONE

let mediaRecorder = null;
let recordedChunks = [];
let audioStream = null;
let audioCtx = null;
let analyserNode = null;
let sourceNode = null;
let animFrameId = null;

// Recording Timer State
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRecording = false;
let isPaused = false;
let currentVisualizerMode = 'spectrum'; // 'spectrum' or 'waveform'

// Export Blobs & Takes
let lastWebmBlob = null;
let lastWavBlob = null;
let lastAudioBuffer = null;
let takeCount = 0;
const sessionTakes = [];

// DOM Elements
const micSelect = document.getElementById('mic-select');
const checkEcho = document.getElementById('check-echo');
const checkNoise = document.getElementById('check-noise');
const btnVizMode = document.getElementById('btn-viz-mode');

const statusPill = document.getElementById('status-pill');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

const studioModeLabel = document.getElementById('studio-mode-label');
const recordPulseDot = document.getElementById('record-pulse-dot');
const timerDisplay = document.getElementById('timer-display');
const visualizerCanvas = document.getElementById('visualizer-canvas');
const vizWrapper = document.getElementById('viz-wrapper');
const vuMeterFill = document.getElementById('vu-meter-fill');
const vuDbText = document.getElementById('vu-db-text');

const btnRecord = document.getElementById('btn-record');
const btnPause = document.getElementById('btn-pause');
const btnStop = document.getElementById('btn-stop');
const btnDiscard = document.getElementById('btn-discard');

const iconMic = document.getElementById('icon-mic');
const iconPause = document.getElementById('icon-pause');

const playbackStudioPanel = document.getElementById('playback-studio-panel');
const recordedAudioPlayer = document.getElementById('recorded-audio-player');
const statDuration = document.getElementById('stat-duration');
const statWavSize = document.getElementById('stat-wav-size');
const statWebmSize = document.getElementById('stat-webm-size');
const statSpecs = document.getElementById('stat-specs');

const btnDownloadWav = document.getElementById('btn-download-wav');
const btnDownloadWebm = document.getElementById('btn-download-webm');

const historyList = document.getElementById('history-list');
const btnClearHistory = document.getElementById('btn-clear-history');

// Format duration
function formatDuration(ms) {
  if (isNaN(ms) || ms < 0) ms = 0;
  const totalSeconds = ms / 1000;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const centis = Math.floor((totalSeconds % 1) * 100);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Device Enumeration
async function populateAudioDevices() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    if (audioInputs.length > 0) {
      micSelect.innerHTML = '';
      audioInputs.forEach((dev, idx) => {
        const opt = document.createElement('option');
        opt.value = dev.deviceId;
        opt.textContent = dev.label || `Microphone ${idx + 1}`;
        micSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.warn('Unable to enumerate audio devices:', err);
  }
}

// Set Studio Status
function setStudioStatus(mode, message) {
  statusText.textContent = message;
  if (mode === 'recording') {
    statusDot.style.background = '#ef4444';
    recordPulseDot.style.display = 'inline-block';
    recordPulseDot.classList.add('pulsing');
    studioModeLabel.textContent = 'RECORDING';
    studioModeLabel.style.color = '#ef4444';
  } else if (mode === 'paused') {
    statusDot.style.background = '#f59e0b';
    recordPulseDot.style.display = 'inline-block';
    recordPulseDot.classList.remove('pulsing');
    studioModeLabel.textContent = 'PAUSED';
    studioModeLabel.style.color = '#f59e0b';
  } else if (mode === 'completed') {
    statusDot.style.background = '#10b981';
    recordPulseDot.style.display = 'none';
    studioModeLabel.textContent = 'FINISHED';
    studioModeLabel.style.color = '#10b981';
  } else {
    statusDot.style.background = 'var(--text-tertiary)';
    recordPulseDot.style.display = 'none';
    studioModeLabel.textContent = 'STANDBY';
    studioModeLabel.style.color = 'var(--text-tertiary)';
  }
}

// Canvas Sizing
function resizeVisualizerCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = vizWrapper.getBoundingClientRect();
  const width = Math.max(300, Math.floor(rect.width));
  const height = Math.max(120, Math.floor(rect.height || 180));

  visualizerCanvas.width = width * dpr;
  visualizerCanvas.height = height * dpr;

  const ctx = visualizerCanvas.getContext('2d');
  ctx.resetTransform ? ctx.resetTransform() : ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resizeVisualizerCanvas);

// Render Idle Background on Visualizer
function renderIdleVisualizer() {
  const width = vizWrapper.clientWidth || 400;
  const height = vizWrapper.clientHeight || 180;
  const ctx = visualizerCanvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  // Subtle center baseline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Subtle floating wave hint
  ctx.strokeStyle = 'rgba(78, 133, 191, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const points = 40;
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const y = height / 2 + Math.sin(i * 0.4) * 6;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// Live Visualizer Loop
function startVisualizerLoop() {
  if (!analyserNode) return;
  const bufferLength = analyserNode.frequencyBinCount;
  const freqData = new Uint8Array(bufferLength);
  const timeData = new Uint8Array(bufferLength);

  function draw() {
    if (!isRecording && !isPaused) return;

    const width = vizWrapper.clientWidth || 400;
    const height = vizWrapper.clientHeight || 180;
    const ctx = visualizerCanvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    if (currentVisualizerMode === 'spectrum') {
      analyserNode.getByteFrequencyData(freqData);

      // Render glowing frequency bars
      const barCount = Math.min(64, Math.floor(width / 7));
      const barWidth = (width / barCount) - 2;
      const step = Math.floor(bufferLength / (barCount * 1.5));

      let totalAmp = 0;

      for (let i = 0; i < barCount; i++) {
        const val = freqData[i * step] || 0;
        totalAmp += val;
        const barHeight = Math.max(3, (val / 255) * (height - 10));
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        const grad = ctx.createLinearGradient(0, height, 0, y);
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(0.5, '#4e85bf');
        grad.addColorStop(1, '#89aacc');

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      // VU Meter calculation
      const avgAmp = totalAmp / barCount;
      const percent = Math.min(100, Math.round((avgAmp / 255) * 125));
      vuMeterFill.style.width = `${percent}%`;
      const dB = avgAmp > 0 ? (20 * Math.log10(avgAmp / 255)).toFixed(1) : '-60.0';
      vuDbText.textContent = `${dB} dB`;

    } else {
      // Waveform Oscilloscope mode
      analyserNode.getByteTimeDomainData(timeData);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#89aacc';
      ctx.shadowColor = '#4e85bf';
      ctx.shadowBlur = 10;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;
      let sumSquares = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * height) / 2;
        const diff = v - 1.0;
        sumSquares += diff * diff;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // VU Meter based on RMS
      const rms = Math.sqrt(sumSquares / bufferLength);
      const percent = Math.min(100, Math.round(rms * 200));
      vuMeterFill.style.width = `${percent}%`;
      const dB = rms > 0 ? (20 * Math.log10(rms)).toFixed(1) : '-60.0';
      vuDbText.textContent = `${dB} dB`;
    }

    animFrameId = requestAnimationFrame(draw);
  }

  animFrameId = requestAnimationFrame(draw);
}

// Timer Functions
function startTimer() {
  startTime = performance.now() - elapsedTime;
  timerInterval = setInterval(() => {
    elapsedTime = performance.now() - startTime;
    timerDisplay.textContent = formatDuration(elapsedTime);
  }, 30);
}

function pauseTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  elapsedTime = 0;
  timerDisplay.textContent = '00:00.00';
}

// Start Recording Workflow
async function startRecording() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support microphone audio capture.');
      return;
    }

    setStudioStatus('standby', 'Requesting Microphone Permission...');

    const constraints = {
      audio: {
        echoCancellation: checkEcho.checked,
        noiseSuppression: checkNoise.checked,
        autoGainControl: true
      }
    };
    if (micSelect.value && micSelect.value !== 'default') {
      constraints.audio.deviceId = { exact: micSelect.value };
    }

    audioStream = await navigator.mediaDevices.getUserMedia(constraints);
    populateAudioDevices(); // refresh label names once permitted

    // Web Audio setup for visualizer
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    sourceNode = audioCtx.createMediaStreamSource(audioStream);
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.82;
    sourceNode.connect(analyserNode);

    // MediaRecorder setup
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];
    let selectedMime = '';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        selectedMime = type;
        break;
      }
    }

    recordedChunks = [];
    mediaRecorder = selectedMime ? new MediaRecorder(audioStream, { mimeType: selectedMime }) : new MediaRecorder(audioStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      await finalizeRecording();
    };

    mediaRecorder.start(100); // 100ms chunks

    isRecording = true;
    isPaused = false;
    setStudioStatus('recording', 'Microphone Active - Recording Take');

    // UI Updates
    btnRecord.classList.add('is-recording');
    btnRecord.title = 'Recording in progress';
    btnPause.disabled = false;
    btnStop.disabled = false;
    btnDiscard.disabled = false;

    resizeVisualizerCanvas();
    startTimer();
    startVisualizerLoop();

  } catch (err) {
    console.error('Microphone error:', err);
    setStudioStatus('standby', 'Microphone Access Denied');
    alert(`Could not start recording: ${err.message || err.name}. Please ensure microphone permission is granted.`);
  }
}

// Pause Recording
function pauseRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    pauseTimer();
    isPaused = true;
    setStudioStatus('paused', 'Recording Paused');
    iconPause.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>'; // switch to play icon
    btnPause.title = 'Resume Recording';
  }
}

// Resume Recording
function resumeRecording() {
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
    startTimer();
    isPaused = false;
    setStudioStatus('recording', 'Microphone Active - Recording Take');
    iconPause.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>'; // switch back to pause bars
    btnPause.title = 'Pause Recording';
  }
}

// Stop Recording
function stopRecording() {
  if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
    mediaRecorder.stop();
  }
  cleanupMediaStream();
  pauseTimer();
  isRecording = false;
  isPaused = false;

  btnRecord.classList.remove('is-recording');
  btnPause.disabled = true;
  btnStop.disabled = true;
  btnDiscard.disabled = false;
  iconPause.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';

  if (animFrameId) cancelAnimationFrame(animFrameId);
  vuMeterFill.style.width = '0%';
  vuDbText.textContent = '-60 dB';
  renderIdleVisualizer();
}

// Discard Recording
function discardRecording() {
  if (isRecording) {
    stopRecording();
  }
  cleanupMediaStream();
  resetTimer();
  recordedChunks = [];
  lastWebmBlob = null;
  lastWavBlob = null;
  playbackStudioPanel.style.display = 'none';
  btnDiscard.disabled = true;
  setStudioStatus('standby', 'Recording Discarded');
}

// Release mic hardware streams
function cleanupMediaStream() {
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }
}

// Convert AudioBuffer to 16-bit PCM WAV Blob
function audioBufferToWavBlob(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const numSamples = buffer.length * numChannels;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM samples
  let offset = 44;
  const channels = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Finalize Recording and prepare playback & export
async function finalizeRecording() {
  takeCount++;
  setStudioStatus('completed', 'Encoding Take and Generating Audio Files...');

  const mimeType = mediaRecorder.mimeType || 'audio/webm';
  lastWebmBlob = new Blob(recordedChunks, { type: mimeType });

  // Read array buffer to decode with Web Audio API
  const arrayBuffer = await lastWebmBlob.arrayBuffer();
  try {
    const decodeCtx = new (window.AudioContext || window.webkitAudioContext)();
    lastAudioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
    lastWavBlob = audioBufferToWavBlob(lastAudioBuffer);

    statSpecs.textContent = `${lastAudioBuffer.sampleRate} Hz ${lastAudioBuffer.numberOfChannels === 1 ? 'Mono' : 'Stereo'} PCM`;
  } catch (err) {
    console.warn('Direct decode to WAV failed, falling back to WebM copy:', err);
    lastWavBlob = lastWebmBlob;
    statSpecs.textContent = `Recorded Stream (${mimeType})`;
  }

  // Update Player & Stats
  const playbackUrl = URL.createObjectURL(lastWavBlob || lastWebmBlob);
  recordedAudioPlayer.src = playbackUrl;

  statDuration.textContent = formatDuration(elapsedTime);
  statWavSize.textContent = formatBytes(lastWavBlob.size);
  statWebmSize.textContent = formatBytes(lastWebmBlob.size);

  playbackStudioPanel.style.display = 'flex';
  setStudioStatus('completed', `Take #${takeCount} Ready`);

  // Add Take to History
  addTakeToHistory({
    takeNumber: takeCount,
    durationText: formatDuration(elapsedTime),
    timestamp: new Date().toLocaleTimeString(),
    wavBlob: lastWavBlob,
    webmBlob: lastWebmBlob,
    playbackUrl
  });
}

// History Management
function addTakeToHistory(take) {
  sessionTakes.unshift(take);
  renderHistory();
}

function renderHistory() {
  if (sessionTakes.length === 0) {
    historyList.innerHTML = `
      <div style="color: var(--text-tertiary); font-size: 0.9rem; text-align: center; padding: 1.5rem 0;">
        No previous recordings yet. Click the red Record button to begin your first session.
      </div>
    `;
    return;
  }

  historyList.innerHTML = '';
  sessionTakes.forEach((take) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="font-weight: 700; color: var(--accent); font-size: 1rem;">Take #${take.takeNumber}</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); font-family: monospace;">${take.durationText}</div>
        <div style="font-size: 0.75rem; color: var(--text-tertiary);">${take.timestamp}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn-step btn-play-take" title="Play take in main player">Play</button>
        <button class="btn-step btn-download-take-wav" title="Download WAV">WAV</button>
        <button class="btn-step btn-download-take-webm" title="Download WebM">WebM</button>
      </div>
    `;

    card.querySelector('.btn-play-take').addEventListener('click', () => {
      recordedAudioPlayer.src = take.playbackUrl;
      recordedAudioPlayer.play();
      playbackStudioPanel.style.display = 'flex';
    });

    card.querySelector('.btn-download-take-wav').addEventListener('click', () => {
      downloadBlob(take.wavBlob, `recording_take_${take.takeNumber}.wav`);
    });

    card.querySelector('.btn-download-take-webm').addEventListener('click', () => {
      downloadBlob(take.webmBlob, `recording_take_${take.takeNumber}.webm`);
    });

    historyList.appendChild(card);
  });
}

function downloadBlob(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Button Listeners
btnRecord.addEventListener('click', () => {
  if (!isRecording) {
    startRecording();
  }
});

btnPause.addEventListener('click', () => {
  if (isPaused) {
    resumeRecording();
  } else {
    pauseRecording();
  }
});

btnStop.addEventListener('click', () => {
  stopRecording();
});

btnDiscard.addEventListener('click', () => {
  discardRecording();
});

btnDownloadWav.addEventListener('click', () => {
  if (lastWavBlob) {
    downloadBlob(lastWavBlob, `voice_recording_take_${takeCount}.wav`);
  }
});

btnDownloadWebm.addEventListener('click', () => {
  if (lastWebmBlob) {
    downloadBlob(lastWebmBlob, `voice_recording_take_${takeCount}.webm`);
  }
});

btnClearHistory.addEventListener('click', () => {
  sessionTakes.length = 0;
  renderHistory();
});

btnVizMode.addEventListener('click', () => {
  if (currentVisualizerMode === 'spectrum') {
    currentVisualizerMode = 'waveform';
    btnVizMode.textContent = 'Visualizer: Oscilloscope';
  } else {
    currentVisualizerMode = 'spectrum';
    btnVizMode.textContent = 'Visualizer: Spectrum';
  }
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  populateAudioDevices();
  resizeVisualizerCanvas();
  renderIdleVisualizer();
});