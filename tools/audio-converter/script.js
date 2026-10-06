// Audio Converter & Format Studio - Client-side Web Audio Engine

let audioCtx = null;
let currentBuffer = null;
let currentFileName = 'audio_sample';
let currentFileSize = 0;
let isPlaying = false;
let activeSourceNode = null;
let playbackGainNode = null;
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

const waveformWrapper = document.getElementById('waveform-wrapper');
const waveformCanvas = document.getElementById('waveform-canvas');
const playbackOverlay = document.getElementById('playback-overlay');

const btnPlayPause = document.getElementById('btn-play-pause');
const playIcon = document.getElementById('play-icon');
const playLabel = document.getElementById('play-label');
const btnStop = document.getElementById('btn-stop');
const readoutCurrent = document.getElementById('readout-current');
const readoutTotal = document.getElementById('readout-total');
const volumeSlider = document.getElementById('volume-slider');

const selectFormat = document.getElementById('select-format');
const bitrateGroup = document.getElementById('bitrate-group');
const selectBitrate = document.getElementById('select-bitrate');
const selectSampleRate = document.getElementById('select-sample-rate');
const selectChannels = document.getElementById('select-channels');

const estimateFileSize = document.getElementById('estimate-file-size');
const estimateSpec = document.getElementById('estimate-spec');
const badgeRatio = document.getElementById('badge-ratio');

const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const statusIndicator = document.getElementById('status-indicator');
const btnConvert = document.getElementById('btn-convert');

const exportPanel = document.getElementById('export-panel');
const exportMetaBadge = document.getElementById('export-meta-badge');
const exportAudioPlayer = document.getElementById('export-audio-player');
const btnDownloadExport = document.getElementById('btn-download-export');

// Audio Context Singleton
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    playbackGainNode = audioCtx.createGain();
    playbackGainNode.gain.value = parseFloat(volumeSlider.value) || 0.9;
    playbackGainNode.connect(audioCtx.destination);
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

// Generate built-in synthesized demo audio
async function generateDemoAudioBuffer() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const demoDuration = 7.0;
  const numSamples = Math.floor(sampleRate * demoDuration);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Synthesize chord progression: Cmaj7 - Am9 - Fmaj7 - G9 with soft envelope & shimmer
  const chords = [
    [261.63, 329.63, 392.00, 493.88], // C E G B
    [220.00, 261.63, 329.63, 392.00], // A C E G
    [174.61, 220.00, 261.63, 329.63], // F A C E
    [196.00, 246.94, 293.66, 392.00]  // G B D G
  ];
  const chordLen = demoDuration / chords.length;

  for (let s = 0; s < numSamples; s++) {
    const t = s / sampleRate;
    const chordIndex = Math.min(chords.length - 1, Math.floor(t / chordLen));
    const chordNotes = chords[chordIndex];
    const chordLocalT = t % chordLen;

    // Smooth envelope per chord
    const env = Math.sin(Math.min(1, chordLocalT / 0.1) * Math.PI * 0.5) *
                Math.max(0, 1 - (chordLocalT / chordLen) * 0.4);

    let mixL = 0;
    let mixR = 0;

    chordNotes.forEach((freq, idx) => {
      // Gentle arpeggio timing
      const arpOffset = idx * 0.18;
      const noteActive = chordLocalT >= arpOffset ? 1 : 0.2;
      const vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5 * t);
      const wave = Math.sin(2 * Math.PI * (freq * vib) * t) * 0.2 +
                   Math.sin(2 * Math.PI * (freq * 2 * vib) * t) * 0.08;
      const pan = (idx - 1.5) / 2; // -0.75 to +0.75
      mixL += wave * noteActive * (1 - pan);
      mixR += wave * noteActive * (1 + pan);
    });

    // Sub-bass root note
    const rootFreq = chordNotes[0] / 2;
    const sub = Math.sin(2 * Math.PI * rootFreq * t) * 0.25;

    left[s] = (mixL * 0.22 + sub) * env;
    right[s] = (mixR * 0.22 + sub) * env;
  }

  return buffer;
}

// Load and decode audio buffer
async function loadAudioBuffer(arrayBuffer, fileName, fileSize) {
  try {
    statusIndicator.textContent = 'Decoding audio file...';
    const ctx = getAudioContext();
    // Copy arrayBuffer to prevent detachment errors
    const copyBuffer = arrayBuffer.slice(0);
    const decodedBuffer = await ctx.decodeAudioData(copyBuffer);

    setAudioData(decodedBuffer, fileName, fileSize);
    statusIndicator.textContent = 'Audio ready for conversion.';
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

  // Update UI metadata
  fileTitle.textContent = fileName;
  tagDuration.textContent = `Duration: ${formatTime(buffer.duration)}`;
  tagRate.textContent = `Sample Rate: ${(buffer.sampleRate / 1000).toFixed(1)} kHz`;
  tagChannels.textContent = `Channels: ${buffer.numberOfChannels === 1 ? 'Mono' : 'Stereo'}`;
  tagSize.textContent = `Input Size: ${formatBytes(currentFileSize)}`;

  readoutCurrent.textContent = '00:00.00';
  readoutTotal.textContent = formatTime(buffer.duration);
  playbackOverlay.style.width = '0%';

  studioPanel.style.display = 'flex';
  exportPanel.style.display = 'none';

  resizeWaveformCanvas();
  renderWaveform();
  updateEstimate();
}

// Render waveform to canvas
function resizeWaveformCanvas() {
  const rect = waveformWrapper.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  waveformCanvas.width = Math.max(300, Math.floor(rect.width * dpr));
  waveformCanvas.height = Math.floor(140 * dpr);
}

function renderWaveform() {
  if (!currentBuffer) return;
  const ctx = waveformCanvas.getContext('2d');
  const w = waveformCanvas.width;
  const h = waveformCanvas.height;
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, w, h);

  // Draw background grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  const channelData = currentBuffer.getChannelData(0);
  const step = Math.ceil(channelData.length / w);
  const amp = (h / 2) * 0.88;

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

// Playback Control
function startPlayback(offset = 0) {
  if (!currentBuffer) return;
  const ctx = getAudioContext();
  stopPlayback();

  activeSourceNode = ctx.createBufferSource();
  activeSourceNode.buffer = currentBuffer;
  activeSourceNode.connect(playbackGainNode);

  playbackOffset = offset;
  playbackStartTime = ctx.currentTime - offset;

  activeSourceNode.onended = () => {
    if (isPlaying) {
      stopPlayback();
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
  playLabel.textContent = 'Play';
}

function tickPlayback() {
  if (!isPlaying || !currentBuffer) return;
  const ctx = getAudioContext();
  const current = ctx.currentTime - playbackStartTime;

  if (current >= currentBuffer.duration) {
    playbackOffset = 0;
    stopPlayback();
    updatePlaybackProgressUI(0);
    return;
  }

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
    playbackOffset = ctx.currentTime - playbackStartTime;
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

volumeSlider.addEventListener('input', (e) => {
  if (playbackGainNode) {
    playbackGainNode.gain.value = parseFloat(e.target.value);
  }
});

// File Size Estimation Engine
function updateEstimate() {
  if (!currentBuffer) return;

  const format = selectFormat.value;
  const sampleRateSetting = selectSampleRate.value;
  const channelsSetting = selectChannels.value;
  const bitrate = parseInt(selectBitrate.value, 10) * 1000;

  const targetRate = sampleRateSetting === 'keep' ? currentBuffer.sampleRate : parseInt(sampleRateSetting, 10);
  const targetChannels = channelsSetting === 'keep' ? currentBuffer.numberOfChannels : parseInt(channelsSetting, 10);
  const dur = currentBuffer.duration;

  let estimatedBytes = 0;
  let specDesc = '';

  if (format === 'wav-16') {
    // 16-bit PCM: 2 bytes per sample * channels * sampleRate * duration + 44 header
    estimatedBytes = Math.round(dur * targetRate * targetChannels * 2) + 44;
    specDesc = `WAV 16-bit PCM • ${(targetRate / 1000).toFixed(1)} kHz • ${targetChannels === 1 ? 'Mono' : 'Stereo'}`;
    bitrateGroup.style.display = 'none';
  } else if (format === 'wav-32') {
    // 32-bit Float: 4 bytes per sample * channels * sampleRate * duration + 44 header
    estimatedBytes = Math.round(dur * targetRate * targetChannels * 4) + 44;
    specDesc = `WAV 32-bit Float • ${(targetRate / 1000).toFixed(1)} kHz • ${targetChannels === 1 ? 'Mono' : 'Stereo'}`;
    bitrateGroup.style.display = 'none';
  } else if (format === 'webm-opus') {
    // WebM Opus: bitrate * duration / 8 + container overhead (~4KB)
    estimatedBytes = Math.round((dur * bitrate) / 8) + 4096;
    specDesc = `WebM / Opus ~${selectBitrate.value} kbps • ${(targetRate / 1000).toFixed(1)} kHz • ${targetChannels === 1 ? 'Mono' : 'Stereo'}`;
    bitrateGroup.style.display = 'flex';
  }

  estimateFileSize.textContent = formatBytes(estimatedBytes);
  estimateSpec.textContent = specDesc;

  // Comparison ratio
  if (currentFileSize > 0) {
    const diff = ((estimatedBytes - currentFileSize) / currentFileSize) * 100;
    if (diff > 0) {
      badgeRatio.textContent = `+${diff.toFixed(0)}% Size`;
      badgeRatio.style.color = 'var(--text-secondary)';
      badgeRatio.style.background = 'rgba(255, 255, 255, 0.08)';
    } else {
      badgeRatio.textContent = `${diff.toFixed(0)}% Smaller`;
      badgeRatio.style.color = 'var(--success)';
      badgeRatio.style.background = 'rgba(16, 185, 129, 0.15)';
    }
  }
}

selectFormat.addEventListener('change', updateEstimate);
selectSampleRate.addEventListener('change', updateEstimate);
selectChannels.addEventListener('change', updateEstimate);
selectBitrate.addEventListener('change', updateEstimate);

// Audio Resampling & Channel Remapping via OfflineAudioContext
async function resampleAndRemapBuffer(sourceBuffer, targetRate, targetChannels, onProgress) {
  const targetSamples = Math.max(1, Math.round(sourceBuffer.duration * targetRate));
  const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    targetChannels,
    targetSamples,
    targetRate
  );

  const bufferSource = offlineCtx.createBufferSource();
  bufferSource.buffer = sourceBuffer;

  if (targetChannels === 1 && sourceBuffer.numberOfChannels > 1) {
    // Downmix to mono with gain adjustment
    const merger = offlineCtx.createChannelMerger(1);
    const splitter = offlineCtx.createChannelSplitter(sourceBuffer.numberOfChannels);
    const sumGain = offlineCtx.createGain();
    sumGain.gain.value = 1 / sourceBuffer.numberOfChannels;

    bufferSource.connect(splitter);
    for (let i = 0; i < sourceBuffer.numberOfChannels; i++) {
      splitter.connect(sumGain, i);
    }
    sumGain.connect(merger, 0, 0);
    merger.connect(offlineCtx.destination);
  } else {
    bufferSource.connect(offlineCtx.destination);
  }

  bufferSource.start(0);

  if (onProgress) onProgress(40);
  const renderedBuffer = await offlineCtx.startRendering();
  if (onProgress) onProgress(75);

  return renderedBuffer;
}

// 16-bit and 32-bit PCM WAV Encoder
function bufferToWavBlob(buffer, is32Bit = false) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = is32Bit ? 32 : 16;
  const format = is32Bit ? 3 : 1; // 1 = PCM, 3 = IEEE Float
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

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave audio samples
  let offset = 44;
  const channels = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  const length = buffer.length;
  if (is32Bit) {
    for (let i = 0; i < length; i++) {
      for (let c = 0; c < numChannels; c++) {
        view.setFloat32(offset, channels[c][i], true);
        offset += 4;
      }
    }
  } else {
    for (let i = 0; i < length; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channels[c][i];
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// WebM / Opus Encoder using MediaRecorder
async function encodeWebmOpus(buffer, bitrate, onProgress) {
  return new Promise((resolve, reject) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: buffer.sampleRate });
      const dest = ctx.createMediaStreamDestination();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(dest);

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

      const recorderOptions = { audioBitsPerSecond: bitrate };
      if (mimeType) recorderOptions.mimeType = mimeType;

      const recorder = new MediaRecorder(dest.stream, recorderOptions);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        try { ctx.close(); } catch (_) {}
        const finalBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
        resolve(finalBlob);
      };

      recorder.onerror = (err) => {
        try { ctx.close(); } catch (_) {}
        reject(err);
      };

      recorder.start();
      source.start(0);

      const startTime = Date.now();
      const totalMs = buffer.duration * 1000;

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(95, 75 + Math.floor((elapsed / totalMs) * 20));
        if (onProgress) onProgress(p);
      }, 100);

      source.onended = () => {
        clearInterval(progressInterval);
        setTimeout(() => {
          if (recorder.state === 'recording') recorder.stop();
        }, 150);
      };
    } catch (err) {
      reject(err);
    }
  });
}

// Convert Action Handler
btnConvert.addEventListener('click', async () => {
  if (!currentBuffer) return;

  try {
    btnConvert.disabled = true;
    statusIndicator.textContent = 'Preparing audio pipeline...';
    progressContainer.style.display = 'block';
    progressFill.style.width = '10%';

    const format = selectFormat.value;
    const sampleRateSetting = selectSampleRate.value;
    const channelsSetting = selectChannels.value;
    const bitrate = parseInt(selectBitrate.value, 10) * 1000;

    const targetRate = sampleRateSetting === 'keep' ? currentBuffer.sampleRate : parseInt(sampleRateSetting, 10);
    const targetChannels = channelsSetting === 'keep' ? currentBuffer.numberOfChannels : parseInt(channelsSetting, 10);

    statusIndicator.textContent = `Resampling to ${(targetRate / 1000).toFixed(1)} kHz (${targetChannels} ch)...`;
    progressFill.style.width = '30%';

    // Step 1: Resample & Remap Channels
    const processedBuffer = await resampleAndRemapBuffer(
      currentBuffer,
      targetRate,
      targetChannels,
      (p) => { progressFill.style.width = `${p}%`; }
    );

    let outputBlob = null;
    let fileExt = 'wav';

    // Step 2: Encode to requested format
    statusIndicator.textContent = 'Encoding output format...';
    if (format === 'wav-16') {
      outputBlob = bufferToWavBlob(processedBuffer, false);
      fileExt = 'wav';
    } else if (format === 'wav-32') {
      outputBlob = bufferToWavBlob(processedBuffer, true);
      fileExt = 'wav';
    } else if (format === 'webm-opus') {
      try {
        outputBlob = await encodeWebmOpus(processedBuffer, bitrate, (p) => {
          progressFill.style.width = `${p}%`;
        });
        fileExt = 'webm';
      } catch (e) {
        console.warn('MediaRecorder Opus encoding unavailable, falling back to WAV:', e);
        outputBlob = bufferToWavBlob(processedBuffer, false);
        fileExt = 'wav';
      }
    }

    progressFill.style.width = '100%';
    statusIndicator.textContent = 'Conversion successful!';

    // Cleanup previous URL
    if (activeObjectUrl) {
      URL.revokeObjectURL(activeObjectUrl);
    }

    activeObjectUrl = URL.createObjectURL(outputBlob);
    const downloadFileName = `${currentFileName}_converted.${fileExt}`;

    // Setup Export Panel
    exportAudioPlayer.src = activeObjectUrl;
    btnDownloadExport.href = activeObjectUrl;
    btnDownloadExport.download = downloadFileName;

    exportMetaBadge.textContent = `${fileExt.toUpperCase()} • ${(targetRate / 1000).toFixed(1)} kHz • ${targetChannels === 1 ? 'Mono' : 'Stereo'} • ${formatBytes(outputBlob.size)}`;
    exportPanel.style.display = 'flex';

    // Auto trigger download
    const autoDownloadLink = document.createElement('a');
    autoDownloadLink.href = activeObjectUrl;
    autoDownloadLink.download = downloadFileName;
    document.body.appendChild(autoDownloadLink);
    autoDownloadLink.click();
    document.body.removeChild(autoDownloadLink);

  } catch (err) {
    console.error('Conversion failed:', err);
    alert('Audio conversion encountered an error: ' + err.message);
    statusIndicator.textContent = 'Conversion failed.';
  } finally {
    btnConvert.disabled = false;
    setTimeout(() => {
      progressContainer.style.display = 'none';
      progressFill.style.width = '0%';
    }, 1500);
  }
});

// File Upload Event Listeners
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
  if (file) handleSelectedFile(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleSelectedFile(file);
});

btnChangeFile.addEventListener('click', () => {
  fileInput.click();
});

function handleSelectedFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    loadAudioBuffer(e.target.result, file.name, file.size);
  };
  reader.readAsArrayBuffer(file);
}

// Built-in Demo Melody
btnLoadDemo.addEventListener('click', async () => {
  statusIndicator.textContent = 'Generating harmonic synthesizer demo...';
  const demoBuf = await generateDemoAudioBuffer();
  setAudioData(demoBuf, 'Polyphonic_Chords_Demo.wav', demoBuf.length * 4);
  statusIndicator.textContent = 'Demo audio loaded.';
});

// Responsive canvas re-render
window.addEventListener('resize', () => {
  if (currentBuffer) {
    resizeWaveformCanvas();
    renderWaveform();
  }
});