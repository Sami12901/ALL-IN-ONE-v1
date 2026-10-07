// Audio Reverser - ALL IN ONE
// Client-side Web Audio API AudioBuffer Reversal & Waveform Processing

let audioCtx = null;
let originalBuffer = null;
let reversedBuffer = null;
let currentFileName = 'audio_track';
let currentFileSize = 0;

// Playback state
let isPlaying = false;
let playMode = 'reversed'; // 'reversed' | 'original'
let activeSource = null;
let gainNode = null;
let playbackStartTime = 0;
let playbackOffset = 0;
let animFrameId = null;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const audioInput = document.getElementById('audio-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const btnReset = document.getElementById('btn-reset');
const fileMetaBadges = document.getElementById('file-meta-badges');
const badgeName = document.getElementById('badge-name');
const badgeDuration = document.getElementById('badge-duration');
const badgeRate = document.getElementById('badge-rate');

const studioWorkspace = document.getElementById('studio-workspace');
const canvasWrapper = document.getElementById('canvas-wrapper');
const waveformCanvas = document.getElementById('waveform-canvas');
const origWaveformCanvas = document.getElementById('orig-waveform-canvas');
const origCanvasWrapper = document.getElementById('orig-canvas-wrapper');

const readoutCurrent = document.getElementById('readout-current');
const readoutTotal = document.getElementById('readout-total');
const readoutEndTick = document.getElementById('readout-end-tick');

const btnModeReversed = document.getElementById('btn-mode-reversed');
const btnModeOriginal = document.getElementById('btn-mode-original');
const btnPlay = document.getElementById('btn-play');
const btnStop = document.getElementById('btn-stop');

const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
const btnSpeedReset = document.getElementById('btn-speed-reset');
const volSlider = document.getElementById('vol-slider');
const volVal = document.getElementById('vol-val');

const checkSmoothEdges = document.getElementById('check-smooth-edges');
const checkNormalize = document.getElementById('check-normalize');
const selectChannels = document.getElementById('select-channels');

const btnExportWav = document.getElementById('btn-export-wav');
const exportPreview = document.getElementById('export-preview');
const exportAudioEl = document.getElementById('export-audio-el');
const exportSizeBadge = document.getElementById('export-size-badge');
const btnDownloadFile = document.getElementById('btn-download-file');

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = parseFloat(volSlider.value) || 1.0;
    gainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Convert AudioBuffer to 16-bit PCM WAV Blob
function audioBufferToWavBlob(buffer, channelMode = 'keep') {
  let numChannels = buffer.numberOfChannels;
  if (channelMode === 'mono') numChannels = 1;
  else if (channelMode === 'stereo') numChannels = 2;

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

  function writeString(v, offset, str) {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF Header
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

  // Interleave and write samples
  let offset = 44;
  const inL = buffer.getChannelData(0);
  const inR = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : inL;

  for (let i = 0; i < buffer.length; i++) {
    if (numChannels === 1) {
      let sample = (inL[i] + inR[i]) * 0.5;
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    } else {
      let sL = inL[i];
      let sR = inR[i];
      sL = Math.max(-1, Math.min(1, sL));
      sR = Math.max(-1, Math.min(1, sR));
      view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
      offset += 2;
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Generate demo audio with distinct forward character (decay chimes, reverse cymbal, arpeggio)
async function generateDemoSound() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const dur = 4.5;
  const numSamples = Math.floor(sampleRate * dur);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Melody notes: E5, G#5, B5, E6 with percussive chime envelopes
  const notes = [659.25, 830.61, 987.77, 1318.51, 987.77, 830.61];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sL = 0, sR = 0;

    // Arpeggiated decaying chime
    const noteIdx = Math.floor(t * 3) % notes.length;
    const noteTime = (t * 3) % 1;
    const env = Math.exp(-noteTime * 4.0);
    const freq = notes[noteIdx];
    const chime = Math.sin(2 * Math.PI * freq * t) * env * 0.25;

    // Bass note
    const bassEnv = Math.exp(-(t % 1.5) * 2.5);
    const bass = Math.sin(2 * Math.PI * 130.81 * t) * bassEnv * 0.3;

    // Sweeping crescendo filter sweep
    const sweep = Math.sin(2 * Math.PI * (200 + t * 400) * t) * (t / dur) * 0.15;

    sL = chime + bass + sweep;
    sR = chime * 0.8 + bass + sweep * 1.1;

    left[i] = sL;
    right[i] = sR;
  }

  currentFileName = 'demo_synthesized_arpeggio.wav';
  currentFileSize = numSamples * 4;
  await setAudioBuffer(buffer);
}

// Create reversed buffer with optional edge de-clicking and normalization
function processReversal(srcBuffer) {
  const ctx = getAudioContext();
  const numChannels = srcBuffer.numberOfChannels;
  const length = srcBuffer.length;
  const sampleRate = srcBuffer.sampleRate;

  const rev = ctx.createBuffer(numChannels, length, sampleRate);
  const smooth = checkSmoothEdges.checked;
  const normalize = checkNormalize.checked;

  const fadeSamples = smooth ? Math.min(Math.floor(0.015 * sampleRate), Math.floor(length / 2)) : 0;

  let peak = 0.0001;

  for (let c = 0; c < numChannels; c++) {
    const srcData = srcBuffer.getChannelData(c);
    const dstData = rev.getChannelData(c);

    for (let i = 0; i < length; i++) {
      let sample = srcData[length - 1 - i];

      // Smooth de-click fade-in at head
      if (fadeSamples > 0 && i < fadeSamples) {
        sample *= (i / fadeSamples);
      }
      // Smooth de-click fade-out at tail
      if (fadeSamples > 0 && (length - 1 - i) < fadeSamples) {
        sample *= ((length - 1 - i) / fadeSamples);
      }

      dstData[i] = sample;
      const abs = Math.abs(sample);
      if (abs > peak) peak = abs;
    }
  }

  // Normalization if requested
  if (normalize && peak > 0) {
    const targetPeak = 0.94; // -0.5 dB
    const scale = targetPeak / peak;
    for (let c = 0; c < numChannels; c++) {
      const data = rev.getChannelData(c);
      for (let i = 0; i < length; i++) {
        data[i] = Math.max(-1, Math.min(1, data[i] * scale));
      }
    }
  }

  return rev;
}

async function setAudioBuffer(buffer) {
  stopPlayback();
  originalBuffer = buffer;
  reversedBuffer = processReversal(originalBuffer);

  // Update Badges & Metadata
  badgeName.textContent = currentFileName;
  badgeDuration.textContent = formatTime(buffer.duration);
  badgeRate.textContent = `${(buffer.sampleRate / 1000).toFixed(1)} kHz • ${buffer.numberOfChannels === 1 ? 'Mono' : 'Stereo'}`;
  readoutTotal.textContent = formatTime(buffer.duration);
  readoutEndTick.textContent = formatTime(buffer.duration);
  readoutCurrent.textContent = formatTime(0);

  fileMetaBadges.style.display = 'flex';
  btnReset.style.display = 'inline-flex';
  studioWorkspace.style.display = 'flex';
  exportPreview.style.display = 'none';

  renderWaveforms(0);
}

// Waveform Rendering
function drawWaveformToCanvas(canvas, buffer, color, playheadTime = null) {
  if (!canvas || !buffer) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width === 0) return;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = rect.height;

  // Background
  ctx.fillStyle = '#070b12';
  ctx.fillRect(0, 0, width, height);

  // Center Line
  const midY = height / 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();

  // Waveform Peaks
  const channelData = buffer.getChannelData(0);
  const step = Math.ceil(channelData.length / width);
  const amp = height * 0.42;

  ctx.fillStyle = color;
  for (let x = 0; x < width; x++) {
    const startSample = Math.floor(x * step);
    const endSample = Math.min(channelData.length, Math.floor((x + 1) * step));
    let min = 1.0;
    let max = -1.0;

    for (let j = startSample; j < endSample; j++) {
      const val = channelData[j];
      if (val < min) min = val;
      if (val > max) max = val;
    }

    if (max < min) {
      min = 0;
      max = 0;
    }

    const yTop = midY - max * amp;
    const yBottom = midY - min * amp;
    const barHeight = Math.max(1.5, yBottom - yTop);
    ctx.fillRect(x, yTop, 1, barHeight);
  }

  // Playhead
  if (playheadTime !== null && playheadTime >= 0 && buffer.duration > 0) {
    const px = Math.min(width, (playheadTime / buffer.duration) * width);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();

    // Playhead arrow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px - 5, 0);
    ctx.lineTo(px + 5, 0);
    ctx.lineTo(px, 7);
    ctx.closePath();
    ctx.fill();
  }
}

function renderWaveforms(currentTime = 0) {
  if (reversedBuffer) {
    drawWaveformToCanvas(waveformCanvas, reversedBuffer, '#89aacc', playMode === 'reversed' ? currentTime : null);
  }
  if (originalBuffer) {
    drawWaveformToCanvas(origWaveformCanvas, originalBuffer, '#4e85bf', playMode === 'original' ? currentTime : null);
  }
}

// Playback Logic
function startPlayback(offset = 0) {
  stopPlayback();
  const currentBuf = playMode === 'reversed' ? reversedBuffer : originalBuffer;
  if (!currentBuf) return;

  const ctx = getAudioContext();
  activeSource = ctx.createBufferSource();
  activeSource.buffer = currentBuf;
  activeSource.playbackRate.value = parseFloat(speedSlider.value) || 1.0;
  activeSource.connect(gainNode);

  playbackOffset = offset;
  playbackStartTime = ctx.currentTime - (playbackOffset / activeSource.playbackRate.value);

  activeSource.start(0, playbackOffset);
  isPlaying = true;

  btnPlay.classList.add('btn-playing');
  btnPlay.querySelector('span').textContent = 'Pause';

  activeSource.onended = () => {
    if (isPlaying && (ctx.currentTime - playbackStartTime) * activeSource.playbackRate.value >= currentBuf.duration - 0.05) {
      stopPlayback();
      playbackOffset = 0;
      readoutCurrent.textContent = formatTime(0);
      renderWaveforms(0);
    }
  };

  function update() {
    if (!isPlaying) return;
    const rate = activeSource ? activeSource.playbackRate.value : 1.0;
    const curTime = (ctx.currentTime - playbackStartTime) * rate;
    readoutCurrent.textContent = formatTime(curTime);
    renderWaveforms(curTime);
    if (curTime < currentBuf.duration) {
      animFrameId = requestAnimationFrame(update);
    }
  }
  update();
}

function pausePlayback() {
  if (!isPlaying) return;
  const ctx = getAudioContext();
  const rate = activeSource ? activeSource.playbackRate.value : 1.0;
  playbackOffset = (ctx.currentTime - playbackStartTime) * rate;

  if (activeSource) {
    try { activeSource.stop(); } catch (_) {}
    activeSource.disconnect();
    activeSource = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animFrameId);
  btnPlay.querySelector('span').textContent = `Resume ${playMode === 'reversed' ? 'Reversed' : 'Original'}`;
}

function stopPlayback() {
  if (activeSource) {
    try { activeSource.stop(); } catch (_) {}
    activeSource.disconnect();
    activeSource = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animFrameId);
  btnPlay.querySelector('span').textContent = `Play ${playMode === 'reversed' ? 'Reversed' : 'Original'}`;
}

// Event Listeners
btnLoadDemo.addEventListener('click', () => {
  generateDemoSound();
});

btnReset.addEventListener('click', () => {
  if (confirm('Reset workspace and remove current audio?')) {
    stopPlayback();
    originalBuffer = null;
    reversedBuffer = null;
    fileMetaBadges.style.display = 'none';
    btnReset.style.display = 'none';
    studioWorkspace.style.display = 'none';
    exportPreview.style.display = 'none';
    audioInput.value = '';
  }
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

async function handleFile(file) {
  const ctx = getAudioContext();
  try {
    currentFileName = file.name;
    currentFileSize = file.size;
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    await setAudioBuffer(decoded);
  } catch (err) {
    console.error('Failed to decode audio file:', err);
    alert('Could not decode audio file. Please try a standard MP3, WAV, or OGG file.');
  }
}

// Mode Buttons
btnModeReversed.addEventListener('click', () => {
  if (playMode === 'reversed') return;
  playMode = 'reversed';
  btnModeReversed.className = 'btn btn-primary';
  btnModeOriginal.className = 'btn btn-secondary';
  stopPlayback();
  playbackOffset = 0;
  readoutCurrent.textContent = formatTime(0);
  renderWaveforms(0);
});

btnModeOriginal.addEventListener('click', () => {
  if (playMode === 'original') return;
  playMode = 'original';
  btnModeOriginal.className = 'btn btn-primary';
  btnModeReversed.className = 'btn btn-secondary';
  stopPlayback();
  playbackOffset = 0;
  readoutCurrent.textContent = formatTime(0);
  renderWaveforms(0);
});

// Play / Stop Buttons
btnPlay.addEventListener('click', () => {
  if (!reversedBuffer) return;
  if (isPlaying) {
    pausePlayback();
  } else {
    startPlayback(playbackOffset);
  }
});

btnStop.addEventListener('click', () => {
  stopPlayback();
  playbackOffset = 0;
  readoutCurrent.textContent = formatTime(0);
  renderWaveforms(0);
});

// Speed Slider
speedSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  speedVal.textContent = `${val.toFixed(2)}x`;
  if (activeSource) {
    activeSource.playbackRate.value = val;
  }
});

btnSpeedReset.addEventListener('click', () => {
  speedSlider.value = '1.0';
  speedVal.textContent = '1.0x';
  if (activeSource) {
    activeSource.playbackRate.value = 1.0;
  }
});

// Volume Slider
volSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  volVal.textContent = `${Math.round(val * 100)}%`;
  if (gainNode) {
    gainNode.gain.value = val;
  }
});

// Edge smooth & Normalize toggles re-process reversed buffer
checkSmoothEdges.addEventListener('change', () => {
  if (originalBuffer) {
    reversedBuffer = processReversal(originalBuffer);
    renderWaveforms(playbackOffset);
  }
});

checkNormalize.addEventListener('change', () => {
  if (originalBuffer) {
    reversedBuffer = processReversal(originalBuffer);
    renderWaveforms(playbackOffset);
  }
});

// Waveform click seeking
canvasWrapper.addEventListener('click', (e) => {
  const currentBuf = playMode === 'reversed' ? reversedBuffer : originalBuffer;
  if (!currentBuf) return;
  const rect = canvasWrapper.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const seekTime = ratio * currentBuf.duration;
  playbackOffset = seekTime;
  readoutCurrent.textContent = formatTime(seekTime);
  renderWaveforms(seekTime);
  if (isPlaying) {
    startPlayback(seekTime);
  }
});

// Export Reversed WAV
btnExportWav.addEventListener('click', () => {
  if (!reversedBuffer) return;

  btnExportWav.disabled = true;
  btnExportWav.innerHTML = 'Rendering Reversed Audio...';

  setTimeout(() => {
    try {
      // Recompute reversed buffer with current settings
      reversedBuffer = processReversal(originalBuffer);
      const chMode = selectChannels.value;
      const wavBlob = audioBufferToWavBlob(reversedBuffer, chMode);
      const url = URL.createObjectURL(wavBlob);

      exportAudioEl.src = url;
      const baseName = currentFileName.replace(/\.[^/.]+$/, '');
      const downloadName = `${baseName}_reversed.wav`;

      btnDownloadFile.href = url;
      btnDownloadFile.download = downloadName;

      exportSizeBadge.textContent = `${formatTime(reversedBuffer.duration)} • ${reversedBuffer.sampleRate} Hz • ${formatBytes(wavBlob.size)}`;
      exportPreview.style.display = 'block';
      exportPreview.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export audio: ' + err.message);
    } finally {
      btnExportWav.disabled = false;
      btnExportWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Export Reversed Audio (.WAV)</span>
      `;
    }
  }, 40);
});

window.addEventListener('resize', () => {
  renderWaveforms(playbackOffset);
});