// Audio Speed Changer & Pitch Controller - Client-side Web Audio

let audioCtx = null;
let currentBuffer = null;
let currentFileName = 'audio_track';
let currentFileSize = 0;
let audioElement = null;
let activeSourceUrl = null;
let activeExportUrl = null;

let isPlaying = false;
let animFrameId = null;

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
const volumeSlider = document.getElementById('volume-slider');

const speedSlider = document.getElementById('speed-slider');
const speedReadout = document.getElementById('speed-readout');
const presetPills = document.querySelectorAll('.preset-pill');

const checkPreservePitch = document.getElementById('check-preserve-pitch');
const pitchModeDesc = document.getElementById('pitch-mode-desc');
const newDurationReadout = document.getElementById('new-duration-readout');
const durationDeltaBadge = document.getElementById('duration-delta-badge');

const statusIndicator = document.getElementById('status-indicator');
const btnDownloadWav = document.getElementById('btn-download-wav');

const exportPanel = document.getElementById('export-panel');
const exportMetaBadge = document.getElementById('export-meta-badge');
const exportAudioPlayer = document.getElementById('export-audio-player');
const btnDownloadExport = document.getElementById('btn-download-export');

// Audio Context Singleton
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

// Generate built-in melodic audio demo
async function generateDemoAudioBuffer() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const demoDuration = 6.0;
  const numSamples = Math.floor(sampleRate * demoDuration);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Acoustic guitar arpeggio progression: D - G - Bm - A
  const chords = [
    [293.66, 369.99, 440.00, 587.33], // D F# A D
    [196.00, 246.94, 293.66, 392.00], // G B D G
    [246.94, 293.66, 369.99, 493.88], // B D F# B
    [220.00, 277.18, 329.63, 440.00]  // A C# E A
  ];
  const chordLen = demoDuration / chords.length;

  for (let s = 0; s < numSamples; s++) {
    const t = s / sampleRate;
    const cIdx = Math.min(chords.length - 1, Math.floor(t / chordLen));
    const chordNotes = chords[cIdx];
    const cLocalT = t % chordLen;

    let mixL = 0;
    let mixR = 0;

    chordNotes.forEach((freq, idx) => {
      const noteOffset = idx * 0.22;
      if (cLocalT >= noteOffset) {
        const noteAge = cLocalT - noteOffset;
        const env = Math.exp(-noteAge * 4.2) * Math.min(1, noteAge * 300);
        // Rich plucked harmonics
        const harm1 = Math.sin(2 * Math.PI * freq * t);
        const harm2 = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.4;
        const harm3 = Math.sin(2 * Math.PI * (freq * 3) * t) * 0.15;
        const signal = (harm1 + harm2 + harm3) * env * 0.22;

        const pan = (idx - 1.5) / 2; // -0.75 to +0.75
        mixL += signal * (1 - pan);
        mixR += signal * (1 + pan);
      }
    });

    left[s] = mixL;
    right[s] = mixR;
  }

  return buffer;
}

// 16-bit PCM WAV Encoder
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

// Load audio file
async function loadAudioBuffer(arrayBuffer, fileName, fileSize) {
  try {
    statusIndicator.textContent = 'Decoding audio...';
    const ctx = getAudioContext();
    const copyBuffer = arrayBuffer.slice(0);
    const decodedBuffer = await ctx.decodeAudioData(copyBuffer);
    setAudioData(decodedBuffer, fileName, fileSize);
  } catch (err) {
    console.error('Audio decoding error:', err);
    alert('Could not decode audio file. Please ensure the file is a valid audio format.');
    statusIndicator.textContent = 'Error decoding audio file.';
  }
}

function setAudioData(buffer, fileName, fileSize) {
  stopPlayback();
  currentBuffer = buffer;
  currentFileName = fileName.replace(/\.[^/.]+$/, '');
  currentFileSize = fileSize || (buffer.length * buffer.numberOfChannels * 2);

  // Initialize HTML5 Audio element for real-time speed & pitch manipulation
  if (activeSourceUrl) {
    URL.revokeObjectURL(activeSourceUrl);
  }
  const initialBlob = bufferToWavBlob(buffer);
  activeSourceUrl = URL.createObjectURL(initialBlob);

  if (!audioElement) {
    audioElement = new Audio();
    audioElement.addEventListener('ended', () => {
      if (!checkLoop.checked) {
        stopPlayback();
        audioElement.currentTime = 0;
        updatePlaybackProgressUI(0);
      }
    });
  }

  audioElement.src = activeSourceUrl;
  audioElement.volume = parseFloat(volumeSlider.value) || 0.9;
  applyAudioElementSpeedSettings();

  fileTitle.textContent = fileName;
  tagDuration.textContent = `Original: ${formatTime(buffer.duration)}`;
  tagRate.textContent = `Sample Rate: ${(buffer.sampleRate / 1000).toFixed(1)} kHz`;
  tagChannels.textContent = `Channels: ${buffer.numberOfChannels === 1 ? 'Mono' : 'Stereo'}`;
  tagSize.textContent = `Input Size: ${formatBytes(currentFileSize)}`;

  readoutCurrent.textContent = '00:00.00';
  readoutTotal.textContent = formatTime(buffer.duration);
  playbackOverlay.style.width = '0%';

  studioPanel.style.display = 'flex';
  exportPanel.style.display = 'none';
  statusIndicator.textContent = 'Audio ready for speed manipulation.';

  resizeWaveformCanvas();
  renderWaveform();
  updateSpeedCalculations();
}

// Waveform Canvas Rendering
function resizeWaveformCanvas() {
  const rect = waveformWrapper.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  waveformCanvas.width = Math.max(300, Math.floor(rect.width * dpr));
  waveformCanvas.height = Math.floor(150 * dpr);
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

  const channelData = currentBuffer.getChannelData(0);
  const step = Math.ceil(channelData.length / w);

  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#89aacc');
  gradient.addColorStop(0.5, '#4e85bf');
  gradient.addColorStop(1, '#2c537d');

  ctx.fillStyle = gradient;

  for (let x = 0; x < w; x++) {
    const start = x * step;
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step && start + j < channelData.length; j++) {
      const val = channelData[start + j];
      if (val < min) min = val;
      if (val > max) max = val;
    }
    if (max < min) {
      min = 0;
      max = 0;
    }
    const yTop = (1 + min) * (h / 2);
    const yBot = (1 + max) * (h / 2);
    ctx.fillRect(x, yTop, 1.2, Math.max(1 * dpr, yBot - yTop));
  }
}

// Waveform seek handler
waveformWrapper.addEventListener('click', (e) => {
  if (!currentBuffer || !audioElement) return;
  const rect = waveformWrapper.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const seekTime = ratio * currentBuffer.duration;

  audioElement.currentTime = seekTime;
  updatePlaybackProgressUI(seekTime);
});

// Playback Controls
function startPlayback() {
  if (!audioElement) return;
  audioElement.play().then(() => {
    isPlaying = true;
    playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    playLabel.textContent = 'Pause';
    tickPlayback();
  }).catch((err) => {
    console.warn('Playback error:', err);
  });
}

function stopPlayback() {
  if (audioElement) {
    audioElement.pause();
  }
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  isPlaying = false;
  playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  playLabel.textContent = 'Play';
}

function tickPlayback() {
  if (!isPlaying || !audioElement || !currentBuffer) return;
  updatePlaybackProgressUI(audioElement.currentTime);
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
    stopPlayback();
  } else {
    startPlayback();
  }
});

btnStop.addEventListener('click', () => {
  stopPlayback();
  if (audioElement) {
    audioElement.currentTime = 0;
  }
  updatePlaybackProgressUI(0);
});

volumeSlider.addEventListener('input', (e) => {
  if (audioElement) {
    audioElement.volume = parseFloat(e.target.value);
  }
});

checkLoop.addEventListener('change', () => {
  if (audioElement) {
    audioElement.loop = checkLoop.checked;
  }
});

// Apply Speed and Pitch properties to HTML5 Audio Element
function applyAudioElementSpeedSettings() {
  if (!audioElement) return;
  const speed = parseFloat(speedSlider.value);
  audioElement.playbackRate = speed;

  // Support pitch preservation properties across browsers
  const preservesPitch = checkPreservePitch.checked;
  if ('preservesPitch' in audioElement) {
    audioElement.preservesPitch = preservesPitch;
  }
  if ('webkitPreservesPitch' in audioElement) {
    audioElement.webkitPreservesPitch = preservesPitch;
  }
  if ('mozPreservesPitch' in audioElement) {
    audioElement.mozPreservesPitch = preservesPitch;
  }
}

// Speed & Calculations Updates
function updateSpeedCalculations() {
  const speed = parseFloat(speedSlider.value);
  speedReadout.textContent = `${speed.toFixed(2)}x`;

  presetPills.forEach((pill) => {
    if (parseFloat(pill.dataset.speed) === speed) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  applyAudioElementSpeedSettings();

  if (currentBuffer) {
    const origDur = currentBuffer.duration;
    const newDur = origDur / speed;
    const deltaSec = newDur - origDur;
    const deltaPct = ((newDur - origDur) / origDur) * 100;

    newDurationReadout.textContent = formatTime(newDur);

    if (Math.abs(deltaSec) < 0.05) {
      durationDeltaBadge.textContent = '0.0s (0%)';
      durationDeltaBadge.style.color = 'var(--text-secondary)';
      durationDeltaBadge.style.background = 'rgba(255, 255, 255, 0.08)';
    } else if (deltaSec < 0) {
      durationDeltaBadge.textContent = `${deltaSec.toFixed(1)}s (${deltaPct.toFixed(0)}%) Faster`;
      durationDeltaBadge.style.color = 'var(--success)';
      durationDeltaBadge.style.background = 'rgba(16, 185, 129, 0.15)';
    } else {
      durationDeltaBadge.textContent = `+${deltaSec.toFixed(1)}s (+${deltaPct.toFixed(0)}%) Slower`;
      durationDeltaBadge.style.color = 'var(--accent-light)';
      durationDeltaBadge.style.background = 'rgba(78, 133, 191, 0.15)';
    }

    readoutTotal.textContent = formatTime(origDur);
  }

  if (checkPreservePitch.checked) {
    pitchModeDesc.textContent = 'Maintains original vocal pitch and musical key without high chipmunk or low monster pitch shifting.';
  } else {
    pitchModeDesc.textContent = 'Classic vinyl / reel-to-reel tape pitch shifting: pitch scales directly with playback speed.';
  }
}

speedSlider.addEventListener('input', updateSpeedCalculations);

presetPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    speedSlider.value = pill.dataset.speed;
    updateSpeedCalculations();
  });
});

checkPreservePitch.addEventListener('change', updateSpeedCalculations);

// DSP Algorithm 1: Tape Resampling (Pitch Shifts with Speed)
function processTapeResample(sourceBuffer, speed) {
  const ctx = getAudioContext();
  const numChannels = sourceBuffer.numberOfChannels;
  const sampleRate = sourceBuffer.sampleRate;
  const origLength = sourceBuffer.length;
  const newLength = Math.max(1, Math.round(origLength / speed));

  const targetBuffer = ctx.createBuffer(numChannels, newLength, sampleRate);

  for (let c = 0; c < numChannels; c++) {
    const srcData = sourceBuffer.getChannelData(c);
    const dstData = targetBuffer.getChannelData(c);

    for (let i = 0; i < newLength; i++) {
      const srcIdx = i * speed;
      const idxFloor = Math.floor(srcIdx);
      const frac = srcIdx - idxFloor;

      if (idxFloor + 1 < origLength) {
        dstData[i] = srcData[idxFloor] * (1 - frac) + srcData[idxFloor + 1] * frac;
      } else if (idxFloor < origLength) {
        dstData[i] = srcData[idxFloor];
      } else {
        dstData[i] = 0;
      }
    }
  }

  return targetBuffer;
}

// DSP Algorithm 2: SOLA Time-Stretching (Pitch Preserved)
function processSolaTimeStretch(sourceBuffer, speed) {
  if (Math.abs(speed - 1.0) < 0.001) {
    return sourceBuffer;
  }

  const ctx = getAudioContext();
  const numChannels = sourceBuffer.numberOfChannels;
  const sampleRate = sourceBuffer.sampleRate;
  const origLength = sourceBuffer.length;
  const targetLength = Math.max(1, Math.round(origLength / speed));

  // SOLA parameters
  const windowSize = 2048; // ~46ms at 44.1kHz
  const synthHop = 512;
  const maxOffset = 256; // search window for synchronization

  // Hann window pre-computation
  const windowArr = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i++) {
    windowArr[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (windowSize - 1)));
  }

  const targetBuffer = ctx.createBuffer(numChannels, targetLength, sampleRate);
  const outChannels = [];
  const inChannels = [];
  const overlapWeights = new Float32Array(targetLength);

  for (let c = 0; c < numChannels; c++) {
    outChannels.push(targetBuffer.getChannelData(c));
    inChannels.push(sourceBuffer.getChannelData(c));
  }

  let synthPos = 0;
  let analysisPos = 0;

  // Process overlapping windows
  while (synthPos + windowSize < targetLength && analysisPos + windowSize + maxOffset < origLength) {
    // Cross-correlation search on channel 0 to find best phase alignment
    let bestOffset = 0;
    if (synthPos > 0) {
      let maxCorr = -Infinity;
      const src0 = inChannels[0];
      const out0 = outChannels[0];

      for (let offset = -maxOffset; offset <= maxOffset; offset += 4) {
        const candidatePos = analysisPos + offset;
        if (candidatePos < 0 || candidatePos + windowSize >= origLength) continue;

        let corr = 0;
        // Sample correlation across hop overlap
        for (let j = 0; j < synthHop; j += 4) {
          corr += out0[synthPos + j] * src0[candidatePos + j];
        }

        if (corr > maxCorr) {
          maxCorr = corr;
          bestOffset = offset;
        }
      }
    }

    const alignedAnalysisPos = Math.max(0, Math.min(origLength - windowSize, analysisPos + bestOffset));

    // Overlap-add into output buffer
    for (let i = 0; i < windowSize; i++) {
      const outIdx = synthPos + i;
      const w = windowArr[i];
      overlapWeights[outIdx] += w;

      for (let c = 0; c < numChannels; c++) {
        outChannels[c][outIdx] += inChannels[c][alignedAnalysisPos + i] * w;
      }
    }

    synthPos += synthHop;
    analysisPos = Math.round(synthPos * speed);
  }

  // Normalize by overlap weights to avoid amplitude ripples
  for (let i = 0; i < targetLength; i++) {
    const weight = overlapWeights[i];
    if (weight > 0.001) {
      for (let c = 0; c < numChannels; c++) {
        outChannels[c][i] /= weight;
      }
    }
  }

  return targetBuffer;
}

// Download Speed-Adjusted WAV Action
btnDownloadWav.addEventListener('click', async () => {
  if (!currentBuffer) return;

  try {
    btnDownloadWav.disabled = true;
    const speed = parseFloat(speedSlider.value);
    const preservePitch = checkPreservePitch.checked;

    statusIndicator.textContent = preservePitch
      ? `Processing pitch-preserving time-stretch (${speed.toFixed(2)}x)...`
      : `Processing tape resample (${speed.toFixed(2)}x)...`;

    await new Promise((r) => setTimeout(r, 40));

    let processedBuffer = null;
    if (preservePitch) {
      processedBuffer = processSolaTimeStretch(currentBuffer, speed);
    } else {
      processedBuffer = processTapeResample(currentBuffer, speed);
    }

    statusIndicator.textContent = 'Encoding WAV 16-bit PCM...';
    const wavBlob = bufferToWavBlob(processedBuffer);

    if (activeExportUrl) {
      URL.revokeObjectURL(activeExportUrl);
    }
    activeExportUrl = URL.createObjectURL(wavBlob);

    const modeTag = preservePitch ? 'timestretch' : 'taperesample';
    const downloadFileName = `${currentFileName}_speed_${speed.toFixed(2)}x_${modeTag}.wav`;

    exportAudioPlayer.src = activeExportUrl;
    btnDownloadExport.href = activeExportUrl;
    btnDownloadExport.download = downloadFileName;

    exportMetaBadge.textContent = `WAV 16-bit • Speed: ${speed.toFixed(2)}x (${preservePitch ? 'Preserve Pitch' : 'Tape Pitch'}) • ${formatBytes(wavBlob.size)}`;
    exportPanel.style.display = 'flex';
    statusIndicator.textContent = 'Audio processing complete!';

    // Auto trigger download
    const autoLink = document.createElement('a');
    autoLink.href = activeExportUrl;
    autoLink.download = downloadFileName;
    document.body.appendChild(autoLink);
    autoLink.click();
    document.body.removeChild(autoLink);

  } catch (err) {
    console.error('Speed conversion failed:', err);
    alert('Failed to process speed change: ' + err.message);
    statusIndicator.textContent = 'Processing error.';
  } finally {
    btnDownloadWav.disabled = false;
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
  statusIndicator.textContent = 'Generating acoustic arpeggio demo...';
  const demoBuf = await generateDemoAudioBuffer();
  setAudioData(demoBuf, 'Acoustic_Guitar_Demo.wav', demoBuf.length * 4);
});

// Window resize
window.addEventListener('resize', () => {
  if (currentBuffer) {
    resizeWaveformCanvas();
    renderWaveform();
  }
});