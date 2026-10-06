// Audio Volume Booster & Loudness Studio - Client-side Web Audio

let audioCtx = null;
let currentBuffer = null;
let currentFileName = 'audio_track';
let currentFileSize = 0;
let originalMaxPeak = 0.5;

let isPlaying = false;
let activeSourceNode = null;
let boostGainNode = null;
let compressorNode = null;
let masterGainNode = null;

let playbackStartTime = 0;
let playbackOffset = 0;
let animFrameId = null;
let activeObjectUrl = null;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('audio-file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const studioPanel = document.getElementById('studio-panel');
const btnChangeFile = document.getElementById('btn-change-file');

const fileTitle = document.getElementById('file-title');
const tagDuration = document.getElementById('tag-duration');
const tagRate = document.getElementById('tag-rate');
const tagChannels = document.getElementById('tag-channels');
const tagSize = document.getElementById('tag-size');
const tagPeak = document.getElementById('tag-peak');

const waveformWrapper = document.getElementById('waveform-wrapper');
const waveformCanvas = document.getElementById('waveform-canvas');
const playbackOverlay = document.getElementById('playback-overlay');

const btnPlayPause = document.getElementById('btn-play-pause');
const playIcon = document.getElementById('play-icon');
const playLabel = document.getElementById('play-label');
const btnStop = document.getElementById('btn-stop');
const checkLoop = document.getElementById('check-loop');
const readoutCurrent = document.getElementById('readout-current');
const readoutTotal = document.getElementById('readout-total');
const masterVolSlider = document.getElementById('master-vol-slider');

const boostSlider = document.getElementById('boost-slider');
const boostReadoutPercent = document.getElementById('boost-readout-percent');
const boostReadoutDb = document.getElementById('boost-readout-db');
const presetPills = document.querySelectorAll('.preset-pill');

const checkLimiter = document.getElementById('check-limiter');
const clippingIndicator = document.getElementById('clipping-indicator');

const btnDownloadBoosted = document.getElementById('btn-download-boosted');
const exportPanel = document.getElementById('export-panel');
const exportMetaBadge = document.getElementById('export-meta-badge');
const exportAudioPlayer = document.getElementById('export-audio-player');
const btnDownloadExport = document.getElementById('btn-download-export');

// Audio Context Singleton & Graph Builder
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function setupAudioNodes() {
  const ctx = getAudioContext();

  if (!boostGainNode) {
    boostGainNode = ctx.createGain();
  }

  if (!compressorNode) {
    compressorNode = ctx.createDynamicsCompressor();
    compressorNode.threshold.value = -1.0;
    compressorNode.knee.value = 12.0;
    compressorNode.ratio.value = 20.0;
    compressorNode.attack.value = 0.003;
    compressorNode.release.value = 0.25;
  }

  if (!masterGainNode) {
    masterGainNode = ctx.createGain();
    masterGainNode.gain.value = parseFloat(masterVolSlider.value) || 0.9;
    masterGainNode.connect(ctx.destination);
  }

  updateLiveAudioRouting();
}

function updateLiveAudioRouting() {
  if (!boostGainNode || !masterGainNode || !compressorNode) return;
  try {
    boostGainNode.disconnect();
    compressorNode.disconnect();
  } catch (_) {}

  const boostVal = parseFloat(boostSlider.value) / 100;
  boostGainNode.gain.value = boostVal;

  if (checkLimiter.checked) {
    // Route: Boost Gain -> Compressor -> Master Monitor
    boostGainNode.connect(compressorNode);
    compressorNode.connect(masterGainNode);
  } else {
    // Route: Boost Gain -> Master Monitor direct
    boostGainNode.connect(masterGainNode);
  }
}

// Format utilities
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.floor((sec % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate quiet demo sound (-14 dBFS)
async function generateDemoAudioBuffer() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const demoDuration = 6.0;
  const numSamples = Math.floor(sampleRate * demoDuration);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Soft piano / music box quiet melody
  const notes = [
    261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00,
    329.63, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66, 261.63
  ];
  const noteDuration = demoDuration / notes.length;

  for (let s = 0; s < numSamples; s++) {
    const t = s / sampleRate;
    const noteIdx = Math.min(notes.length - 1, Math.floor(t / noteDuration));
    const noteFreq = notes[noteIdx];
    const noteLocalT = t % noteDuration;

    // Pluck decay envelope
    const env = Math.exp(-noteLocalT * 6.5) * Math.min(1, noteLocalT * 200);

    // Subtle fundamental + harmonic with low amplitude
    const wave1 = Math.sin(2 * Math.PI * noteFreq * t);
    const wave2 = Math.sin(2 * Math.PI * (noteFreq * 2) * t) * 0.35;
    const sample = (wave1 + wave2) * env * 0.18; // Deliberately quiet (~ -15 dB)

    left[s] = sample;
    right[s] = sample * 0.95;
  }

  return buffer;
}

// Load audio file
async function loadAudioBuffer(arrayBuffer, fileName, fileSize) {
  try {
    const ctx = getAudioContext();
    const copyBuffer = arrayBuffer.slice(0);
    const decodedBuffer = await ctx.decodeAudioData(copyBuffer);
    setAudioData(decodedBuffer, fileName, fileSize);
  } catch (err) {
    console.error('Audio decoding error:', err);
    alert('Could not decode audio file. Please ensure the file is a valid audio format.');
  }
}

function setAudioData(buffer, fileName, fileSize) {
  stopPlayback();
  currentBuffer = buffer;
  currentFileName = fileName.replace(/\.[^/.]+$/, '');
  currentFileSize = fileSize || (buffer.length * buffer.numberOfChannels * 2);

  // Measure peak amplitude
  let maxPeak = 0.0001;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i += 20) {
      const abs = Math.abs(data[i]);
      if (abs > maxPeak) maxPeak = abs;
    }
  }
  originalMaxPeak = maxPeak;
  const peakDb = 20 * Math.log10(originalMaxPeak);

  fileTitle.textContent = fileName;
  tagDuration.textContent = `Duration: ${formatTime(buffer.duration)}`;
  tagRate.textContent = `Sample Rate: ${(buffer.sampleRate / 1000).toFixed(1)} kHz`;
  tagChannels.textContent = `Channels: ${buffer.numberOfChannels === 1 ? 'Mono' : 'Stereo'}`;
  tagSize.textContent = `Input Size: ${formatBytes(currentFileSize)}`;
  tagPeak.textContent = `Original Peak: ${peakDb.toFixed(1)} dBFS`;

  readoutCurrent.textContent = '00:00.00';
  readoutTotal.textContent = formatTime(buffer.duration);
  playbackOverlay.style.width = '0%';

  studioPanel.style.display = 'flex';
  exportPanel.style.display = 'none';

  setupAudioNodes();
  resizeWaveformCanvas();
  renderWaveform();
  updateBoostDisplay();
}

// Waveform Canvas Rendering
function resizeWaveformCanvas() {
  const rect = waveformWrapper.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  waveformCanvas.width = Math.max(300, Math.floor(rect.width * dpr));
  waveformCanvas.height = Math.floor(160 * dpr);
}

function renderWaveform() {
  if (!currentBuffer) return;
  const ctx = waveformCanvas.getContext('2d');
  const w = waveformCanvas.width;
  const h = waveformCanvas.height;
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, w, h);

  // Center line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // Draw 0 dBFS limit boundary lines
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(w, 4);
  ctx.moveTo(0, h - 4);
  ctx.lineTo(w, h - 4);
  ctx.stroke();
  ctx.setLineDash([]);

  const channelData = currentBuffer.getChannelData(0);
  const step = Math.ceil(channelData.length / w);
  const boostMult = parseFloat(boostSlider.value) / 100;
  const limiterActive = checkLimiter.checked;

  for (let x = 0; x < w; x++) {
    const start = x * step;
    let min = 0;
    let max = 0;
    for (let j = 0; j < step && start + j < channelData.length; j++) {
      const val = channelData[start + j];
      if (val < min) min = val;
      if (val > max) max = val;
    }

    // Original amplitude
    const origTop = (1 + min) * (h / 2);
    const origBot = (1 + max) * (h / 2);

    // Boosted amplitude
    let bMin = min * boostMult;
    let bMax = max * boostMult;

    let isClipping = false;
    if (limiterActive) {
      // Soft saturation curve for visualizer
      bMin = Math.tanh(bMin);
      bMax = Math.tanh(bMax);
    } else {
      if (bMin < -1 || bMax > 1) isClipping = true;
      bMin = Math.max(-1, Math.min(1, bMin));
      bMax = Math.max(-1, Math.min(1, bMax));
    }

    const boostTop = (1 + bMin) * (h / 2);
    const boostBot = (1 + bMax) * (h / 2);

    // Draw boosted background waveform
    ctx.fillStyle = isClipping ? 'rgba(239, 68, 68, 0.65)' : 'rgba(78, 133, 191, 0.55)';
    ctx.fillRect(x, boostTop, 1.2, Math.max(1 * dpr, boostBot - boostTop));

    // Draw inner original waveform
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(x, origTop, 1.2, Math.max(1 * dpr, origBot - origTop));
  }
}

// Waveform click to seek
waveformWrapper.addEventListener('click', (e) => {
  if (!currentBuffer) return;
  const rect = waveformWrapper.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const seekTime = ratio * currentBuffer.duration;

  if (isPlaying) {
    stopPlayback();
    startPlayback(seekTime);
  } else {
    playbackOffset = seekTime;
    updatePlaybackProgressUI(seekTime);
  }
});

// Live Playback Engine
function startPlayback(offset = 0) {
  if (!currentBuffer) return;
  const ctx = getAudioContext();
  setupAudioNodes();
  stopPlayback();

  activeSourceNode = ctx.createBufferSource();
  activeSourceNode.buffer = currentBuffer;
  activeSourceNode.loop = checkLoop.checked;
  activeSourceNode.connect(boostGainNode);

  playbackOffset = offset;
  playbackStartTime = ctx.currentTime - offset;

  activeSourceNode.onended = () => {
    if (isPlaying && !checkLoop.checked) {
      stopPlayback();
      playbackOffset = 0;
      updatePlaybackProgressUI(0);
    }
  };

  activeSourceNode.start(0, offset);
  isPlaying = true;

  playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
  playLabel.textContent = 'Pause';

  tickPlayback();
}

function stopPlayback() {
  if (activeSourceNode) {
    try {
      activeSourceNode.stop();
      activeSourceNode.disconnect();
    } catch (_) {}
    activeSourceNode = null;
  }
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  isPlaying = false;
  playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  playLabel.textContent = 'Play Boosted';
}

function tickPlayback() {
  if (!isPlaying || !currentBuffer) return;
  const ctx = getAudioContext();
  const current = (ctx.currentTime - playbackStartTime) % currentBuffer.duration;

  updatePlaybackProgressUI(current);
  animFrameId = requestAnimationFrame(tickPlayback);
}

function updatePlaybackProgressUI(sec) {
  if (!currentBuffer) return;
  const percent = Math.min(100, Math.max(0, (sec / currentBuffer.duration) * 100));
  playbackOverlay.style.width = `${percent}%`;
  readoutCurrent.textContent = formatTime(sec);
}

btnPlayPause.addEventListener('click', () => {
  if (!currentBuffer) return;
  if (isPlaying) {
    const ctx = getAudioContext();
    playbackOffset = (ctx.currentTime - playbackStartTime) % currentBuffer.duration;
    stopPlayback();
  } else {
    startPlayback(playbackOffset >= currentBuffer.duration ? 0 : playbackOffset);
  }
});

btnStop.addEventListener('click', () => {
  stopPlayback();
  playbackOffset = 0;
  updatePlaybackProgressUI(0);
});

masterVolSlider.addEventListener('input', (e) => {
  if (masterGainNode) {
    masterGainNode.gain.value = parseFloat(e.target.value);
  }
});

checkLoop.addEventListener('change', () => {
  if (activeSourceNode) {
    activeSourceNode.loop = checkLoop.checked;
  }
});

// Boost Slider & Preset Logic
function updateBoostDisplay() {
  const percent = parseInt(boostSlider.value, 10);
  const gain = percent / 100;
  const db = 20 * Math.log10(gain);

  boostReadoutPercent.textContent = `${percent}%`;
  boostReadoutDb.textContent = `${db >= 0 ? '+' : ''}${db.toFixed(1)} dB`;

  // Update preset pills active state
  presetPills.forEach((pill) => {
    if (parseInt(pill.dataset.boost, 10) === percent) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Evaluate Peak Status
  const boostedPeak = originalMaxPeak * gain;
  if (checkLimiter.checked) {
    clippingIndicator.className = 'clipping-badge safe';
    clippingIndicator.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success); display: inline-block;"></span><span>SAFE (Studio Limiter Active)</span>';
  } else if (boostedPeak > 1.0) {
    const overDb = 20 * Math.log10(boostedPeak);
    clippingIndicator.className = 'clipping-badge clipped';
    clippingIndicator.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--danger); display: inline-block;"></span><span>CLIPPING! (+${overDb.toFixed(1)} dBFS Over 0dB)</span>`;
  } else {
    clippingIndicator.className = 'clipping-badge safe';
    clippingIndicator.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success); display: inline-block;"></span><span>SAFE (Within 0 dBFS)</span>';
  }

  updateLiveAudioRouting();
  renderWaveform();
}

boostSlider.addEventListener('input', updateBoostDisplay);

presetPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    boostSlider.value = pill.dataset.boost;
    updateBoostDisplay();
  });
});

checkLimiter.addEventListener('change', () => {
  updateLiveAudioRouting();
  updateBoostDisplay();
});

// WAV 16-Bit PCM Encoder
function bufferToWavBlob(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const format = 1; // PCM
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channels = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  const length = buffer.length;
  for (let i = 0; i < length; i++) {
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

// Download Boosted WAV Action
btnDownloadBoosted.addEventListener('click', async () => {
  if (!currentBuffer) return;

  try {
    btnDownloadBoosted.disabled = true;
    const boostGain = parseFloat(boostSlider.value) / 100;
    const isLimiterOn = checkLimiter.checked;

    // Fast OfflineAudioContext rendering
    const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
      currentBuffer.numberOfChannels,
      currentBuffer.length,
      currentBuffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = currentBuffer;

    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = boostGain;

    if (isLimiterOn) {
      const comp = offlineCtx.createDynamicsCompressor();
      comp.threshold.value = -1.0;
      comp.knee.value = 12.0;
      comp.ratio.value = 20.0;
      comp.attack.value = 0.003;
      comp.release.value = 0.25;

      source.connect(gainNode);
      gainNode.connect(comp);
      comp.connect(offlineCtx.destination);
    } else {
      source.connect(gainNode);
      gainNode.connect(offlineCtx.destination);
    }

    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();

    // Secondary soft limiter safety when limiter is on
    if (isLimiterOn) {
      for (let c = 0; c < renderedBuffer.numberOfChannels; c++) {
        const d = renderedBuffer.getChannelData(c);
        for (let i = 0; i < d.length; i++) {
          if (d[i] > 0.99) d[i] = 0.99;
          else if (d[i] < -0.99) d[i] = -0.99;
        }
      }
    }

    const wavBlob = bufferToWavBlob(renderedBuffer);

    if (activeObjectUrl) {
      URL.revokeObjectURL(activeObjectUrl);
    }

    activeObjectUrl = URL.createObjectURL(wavBlob);
    const db = 20 * Math.log10(boostGain);
    const downloadFileName = `${currentFileName}_boosted_${boostSlider.value}pct.wav`;

    exportAudioPlayer.src = activeObjectUrl;
    btnDownloadExport.href = activeObjectUrl;
    btnDownloadExport.download = downloadFileName;

    exportMetaBadge.textContent = `WAV 16-bit • Boost: ${db >= 0 ? '+' : ''}${db.toFixed(1)} dB (${boostSlider.value}%) • ${formatBytes(wavBlob.size)}`;
    exportPanel.style.display = 'flex';

    // Auto trigger download
    const autoLink = document.createElement('a');
    autoLink.href = activeObjectUrl;
    autoLink.download = downloadFileName;
    document.body.appendChild(autoLink);
    autoLink.click();
    document.body.removeChild(autoLink);

  } catch (err) {
    console.error('Boost export error:', err);
    alert('Failed to export boosted audio: ' + err.message);
  } finally {
    btnDownloadBoosted.disabled = false;
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
  if (file) handleAudioFile(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleAudioFile(file);
});

btnChangeFile.addEventListener('click', () => {
  fileInput.click();
});

function handleAudioFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    loadAudioBuffer(e.target.result, file.name, file.size);
  };
  reader.readAsArrayBuffer(file);
}

// Built-in Demo Melody
btnLoadDemo.addEventListener('click', async () => {
  const demoBuf = await generateDemoAudioBuffer();
  setAudioData(demoBuf, 'Quiet_Music_Box_Demo.wav', demoBuf.length * 4);
});

// Window resize
window.addEventListener('resize', () => {
  if (currentBuffer) {
    resizeWaveformCanvas();
    renderWaveform();
  }
});