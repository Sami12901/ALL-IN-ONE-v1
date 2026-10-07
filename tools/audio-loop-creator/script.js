// Audio Loop Creator & Seamless Seam Designer - ALL IN ONE
// Client-side Web Audio API Loop Points, BPM Tap/Auto-Detect, Anti-Click Blending & WAV Export

let audioCtx = null;
let currentBuffer = null;
let currentFileName = 'audio_loop.wav';

// Loop points
let loopIn = 0.0;
let loopOut = 2.0;

// Dragging state on canvas
let isDraggingIn = false;
let isDraggingOut = false;
let isDraggingRegion = false;
let dragStartX = 0;
let initialLoopIn = 0;
let initialLoopOut = 0;

// Playback state
let isPlaying = false;
let activeSource = null;
let loopCycleCount = 0;
let animFrameId = null;
let playbackStartCtxTime = 0;

// Tap Tempo
let tapTimes = [];

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const audioInput = document.getElementById('audio-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const btnReset = document.getElementById('btn-reset');
const fileMetaBadges = document.getElementById('file-meta-badges');
const badgeName = document.getElementById('badge-name');
const badgeDuration = document.getElementById('badge-duration');
const badgeLoopCycles = document.getElementById('badge-loop-cycles');

const studioWorkspace = document.getElementById('studio-workspace');
const canvasWrapper = document.getElementById('canvas-wrapper');
const waveformCanvas = document.getElementById('waveform-canvas');
const readoutLoopDur = document.getElementById('readout-loop-dur');
const readoutTotalTime = document.getElementById('readout-total-time');

const inputLoopIn = document.getElementById('input-loop-in');
const inputLoopOut = document.getElementById('input-loop-out');
const btnSetLoopInNow = document.getElementById('btn-set-loop-in-now');
const btnSetLoopOutNow = document.getElementById('btn-set-loop-out-now');

const inputBpm = document.getElementById('input-bpm');
const btnTapTempo = document.getElementById('btn-tap-tempo');
const btnAutoBpm = document.getElementById('btn-auto-bpm');
const snapButtons = document.querySelectorAll('.btn-snap');

const seamSlider = document.getElementById('seam-slider');
const seamVal = document.getElementById('seam-val');
const selectRepeats = document.getElementById('select-repeats');

const btnLoopPlay = document.getElementById('btn-loop-play');
const btnLoopStop = document.getElementById('btn-loop-stop');
const btnExportLoop = document.getElementById('btn-export-loop');

const exportPanel = document.getElementById('export-panel');
const exportDetails = document.getElementById('export-details');
const exportAudio = document.getElementById('export-audio');
const btnDownloadLoop = document.getElementById('btn-download-loop');

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
function audioBufferToWavBlob(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const dataSize = buffer.length * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;

  for (let i = 0; i < buffer.length; i++) {
    let sL = Math.max(-1, Math.min(1, left[i]));
    let sR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
    offset += 2;
    if (numChannels > 1) {
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Synthesize 120 BPM Electronic Beat Loop (4.0s = exactly 2 bars)
async function generateDemoGroove() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const dur = 4.0; // 2 bars @ 120 BPM
  const numSamples = Math.floor(sampleRate * dur);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Kick on quarter notes (every 0.5s)
    const kickBeat = (t * 2) % 1;
    const kick = Math.sin(2 * Math.PI * 58 * t) * Math.exp(-kickBeat * 16) * 0.35;

    // Snare on 2 and 4 (beats 1, 3 in 0.5s steps)
    const snareBeat = ((t + 0.25) * 2) % 1;
    const snareNoise = (Math.random() * 2 - 1) * Math.exp(-snareBeat * 18) * 0.22;
    const snareTone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-snareBeat * 20) * 0.15;
    const snare = snareNoise + snareTone;

    // Hi-hat 16th notes (every 0.125s)
    const hatBeat = (t * 8) % 1;
    const hat = (Math.random() * 2 - 1) * Math.exp(-hatBeat * 30) * 0.08;

    // Funky bassline (root notes A1, C2, D2, F2)
    const bassNotes = [110.0, 130.81, 146.83, 174.61];
    const bassIdx = Math.floor(t * 2) % bassNotes.length;
    const bassEnv = Math.exp(-(t % 0.25) * 6);
    const bass = Math.sin(2 * Math.PI * bassNotes[bassIdx] * t) * bassEnv * 0.25;

    left[i] = kick + snare + hat + bass;
    right[i] = kick + snare + hat * 0.8 + bass * 0.95;
  }

  currentFileName = 'demo_drum_groove_120bpm.wav';
  await setAudioBuffer(buffer);
  inputBpm.value = 120;
  loopIn = 0.0;
  loopOut = 2.0; // Exactly 1 bar
  syncInputs();
  renderWaveform();
}

async function setAudioBuffer(buffer) {
  stopLoopPlayback();
  currentBuffer = buffer;

  badgeName.textContent = currentFileName;
  badgeDuration.textContent = formatTime(buffer.duration);
  readoutTotalTime.textContent = formatTime(buffer.duration);

  loopIn = 0.0;
  loopOut = Math.min(buffer.duration, 2.0);

  fileMetaBadges.style.display = 'flex';
  btnReset.style.display = 'inline-flex';
  studioWorkspace.style.display = 'flex';
  exportPanel.style.display = 'none';

  syncInputs();
  renderWaveform();
}

function syncInputs() {
  inputLoopIn.value = loopIn.toFixed(3);
  inputLoopOut.value = loopOut.toFixed(3);
  const dur = Math.max(0, loopOut - loopIn);
  readoutLoopDur.textContent = `${dur.toFixed(3)}s`;
}

// Render Waveform Canvas with High-DPI & Draggable Loop Markers
function renderWaveform(currentPlayhead = null) {
  if (!waveformCanvas || !currentBuffer) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvasWrapper.getBoundingClientRect();
  if (rect.width === 0) return;

  waveformCanvas.width = rect.width * dpr;
  waveformCanvas.height = rect.height * dpr;

  const ctx = waveformCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = rect.height;

  // Background
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, width, height);

  const duration = currentBuffer.duration;
  if (duration <= 0) return;

  // In/Out pixel coordinates
  const inX = (loopIn / duration) * width;
  const outX = (loopOut / duration) * width;

  // Highlight Active Loop Region
  ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
  ctx.fillRect(inX, 0, Math.max(0, outX - inX), height);

  // Center Line
  const midY = height / 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();

  // Waveform Peaks
  const cData = currentBuffer.getChannelData(0);
  const step = Math.ceil(cData.length / width);
  const amp = height * 0.42;

  for (let x = 0; x < width; x++) {
    const isInsideLoop = (x >= inX && x <= outX);
    ctx.fillStyle = isInsideLoop ? '#06b6d4' : '#4b5563';

    const start = Math.floor(x * step);
    const end = Math.min(cData.length, Math.floor((x + 1) * step));
    let min = 1.0, max = -1.0;
    for (let j = start; j < end; j++) {
      const v = cData[j];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (max < min) { min = 0; max = 0; }
    const yTop = midY - max * amp;
    const yBottom = midY - min * amp;
    ctx.fillRect(x, yTop, 1, Math.max(1.5, yBottom - yTop));
  }

  // Draw Loop In Line & Handle [A]
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(inX, 0);
  ctx.lineTo(inX, height);
  ctx.stroke();

  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(inX - 10, 0, 20, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('A', inX, 14);

  // Draw Loop Out Line & Handle [B]
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(outX, 0);
  ctx.lineTo(outX, height);
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.fillRect(outX - 10, 0, 20, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('B', outX, 14);

  // Draw Playhead
  if (currentPlayhead !== null && currentPlayhead >= 0) {
    const px = Math.min(width, (currentPlayhead / duration) * width);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px - 4, 0);
    ctx.lineTo(px + 4, 0);
    ctx.lineTo(px, 7);
    ctx.closePath();
    ctx.fill();
  }
}

// Drag & Scrub Events on Waveform Canvas
canvasWrapper.addEventListener('mousedown', (e) => {
  if (!currentBuffer) return;
  const rect = canvasWrapper.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const duration = currentBuffer.duration;
  const inX = (loopIn / duration) * rect.width;
  const outX = (loopOut / duration) * rect.width;

  dragStartX = mouseX;
  initialLoopIn = loopIn;
  initialLoopOut = loopOut;

  if (Math.abs(mouseX - inX) <= 12) {
    isDraggingIn = true;
  } else if (Math.abs(mouseX - outX) <= 12) {
    isDraggingOut = true;
  } else if (mouseX > inX + 12 && mouseX < outX - 12) {
    isDraggingRegion = true;
  } else {
    // Click outside: set nearest marker
    const clickTime = (mouseX / rect.width) * duration;
    if (Math.abs(clickTime - loopIn) < Math.abs(clickTime - loopOut)) {
      loopIn = Math.max(0, Math.min(loopOut - 0.05, clickTime));
    } else {
      loopOut = Math.min(duration, Math.max(loopIn + 0.05, clickTime));
    }
    syncInputs();
    renderWaveform();
  }
});

window.addEventListener('mousemove', (e) => {
  if (!currentBuffer) return;
  if (!isDraggingIn && !isDraggingOut && !isDraggingRegion) return;

  const rect = canvasWrapper.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const duration = currentBuffer.duration;
  const time = Math.max(0, Math.min(duration, (mouseX / rect.width) * duration));

  if (isDraggingIn) {
    loopIn = Math.max(0, Math.min(loopOut - 0.05, time));
  } else if (isDraggingOut) {
    loopOut = Math.min(duration, Math.max(loopIn + 0.05, time));
  } else if (isDraggingRegion) {
    const deltaTime = ((mouseX - dragStartX) / rect.width) * duration;
    const loopLen = initialLoopOut - initialLoopIn;
    let newIn = initialLoopIn + deltaTime;
    let newOut = newIn + loopLen;
    if (newIn < 0) {
      newIn = 0;
      newOut = loopLen;
    }
    if (newOut > duration) {
      newOut = duration;
      newIn = duration - loopLen;
    }
    loopIn = newIn;
    loopOut = newOut;
  }

  syncInputs();
  renderWaveform();
});

window.addEventListener('mouseup', () => {
  isDraggingIn = false;
  isDraggingOut = false;
  isDraggingRegion = false;
});

// Numeric input listeners
inputLoopIn.addEventListener('change', () => {
  const val = parseFloat(inputLoopIn.value) || 0;
  loopIn = Math.max(0, Math.min(loopOut - 0.05, val));
  syncInputs();
  renderWaveform();
});

inputLoopOut.addEventListener('change', () => {
  const val = parseFloat(inputLoopOut.value) || 0;
  if (currentBuffer) {
    loopOut = Math.min(currentBuffer.duration, Math.max(loopIn + 0.05, val));
  }
  syncInputs();
  renderWaveform();
});

// Set to playhead buttons
function getCurrentPlayheadTime() {
  if (!isPlaying || !activeSource) return loopIn;
  const ctx = getAudioContext();
  const elapsed = ctx.currentTime - playbackStartCtxTime;
  const loopLen = loopOut - loopIn;
  return loopIn + (elapsed % loopLen);
}

btnSetLoopInNow.addEventListener('click', () => {
  const cur = getCurrentPlayheadTime();
  if (cur < loopOut - 0.05) {
    loopIn = cur;
    syncInputs();
    renderWaveform();
  }
});

btnSetLoopOutNow.addEventListener('click', () => {
  const cur = getCurrentPlayheadTime();
  if (cur > loopIn + 0.05) {
    loopOut = cur;
    syncInputs();
    renderWaveform();
  }
});

// Tap Tempo logic
btnTapTempo.addEventListener('click', () => {
  const now = Date.now();
  tapTimes.push(now);
  if (tapTimes.length > 5) tapTimes.shift();

  if (tapTimes.length >= 2) {
    const intervals = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1]);
    }
    const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (avgMs > 0) {
      const detectedBpm = Math.round(60000 / avgMs);
      if (detectedBpm >= 40 && detectedBpm <= 240) {
        inputBpm.value = detectedBpm;
        btnTapTempo.querySelector('span').textContent = `${detectedBpm} BPM`;
        setTimeout(() => {
          btnTapTempo.querySelector('span').textContent = 'Tap Tempo';
        }, 1500);
      }
    }
  }
});

// Auto-detect BPM algorithm using audio energy peak autocorrelation
btnAutoBpm.addEventListener('click', () => {
  if (!currentBuffer) return;
  const channelData = currentBuffer.getChannelData(0);
  const sampleRate = currentBuffer.sampleRate;
  const scanLen = Math.min(channelData.length, sampleRate * 6); // scan up to 6s

  // Compute energy in 10ms windows
  const windowSize = Math.floor(sampleRate * 0.01);
  const numWindows = Math.floor(scanLen / windowSize);
  const energy = new Float32Array(numWindows);

  for (let w = 0; w < numWindows; w++) {
    let sum = 0;
    const start = w * windowSize;
    for (let i = 0; i < windowSize; i++) {
      sum += Math.abs(channelData[start + i]);
    }
    energy[w] = sum / windowSize;
  }

  // Detect peak intervals
  let prevVal = 0;
  const peaks = [];
  for (let w = 1; w < numWindows - 1; w++) {
    if (energy[w] > energy[w - 1] && energy[w] > energy[w + 1] && energy[w] > 0.08) {
      peaks.push(w * 0.01); // time in sec
    }
  }

  if (peaks.length >= 3) {
    const diffs = [];
    for (let i = 1; i < peaks.length; i++) {
      const d = peaks[i] - peaks[i - 1];
      if (d >= 0.25 && d <= 1.5) diffs.push(d);
    }
    if (diffs.length > 0) {
      const avgInterval = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const bpm = Math.round(60 / avgInterval);
      if (bpm >= 60 && bpm <= 200) {
        inputBpm.value = bpm;
        alert(`Estimated tempo: ${bpm} BPM`);
        return;
      }
    }
  }

  alert('Could not detect distinct rhythm. Try Tap Tempo instead.');
});

// Snap Loop Length to Musical Beats
snapButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!currentBuffer) return;
    const beats = parseInt(btn.dataset.beats, 10);
    const bpm = parseFloat(inputBpm.value) || 120;
    const beatDuration = 60 / bpm;
    const targetLength = beats * beatDuration;

    if (loopIn + targetLength <= currentBuffer.duration) {
      loopOut = loopIn + targetLength;
    } else {
      // Fit to end of buffer
      loopOut = currentBuffer.duration;
      loopIn = Math.max(0, loopOut - targetLength);
    }

    syncInputs();
    renderWaveform();
  });
});

// Seam Slider
seamSlider.addEventListener('input', (e) => {
  seamVal.textContent = `${e.target.value} ms`;
});

// Slices and applies equal-power crossfade blending between seam tail and head
function generateSeamedLoopSlice(buffer, startSec, endSec, seamMs) {
  const ctx = getAudioContext();
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;

  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = Math.min(buffer.length, Math.floor(endSec * sampleRate));
  const sliceLen = endSample - startSample;

  if (sliceLen <= 0) return null;

  const slice = ctx.createBuffer(numChannels, sliceLen, sampleRate);
  const seamSamples = Math.min(Math.floor((seamMs / 1000) * sampleRate), Math.floor(sliceLen / 4));

  for (let c = 0; c < numChannels; c++) {
    const src = buffer.getChannelData(c);
    const dst = slice.getChannelData(c);

    // Initial raw copy
    for (let i = 0; i < sliceLen; i++) {
      dst[i] = src[startSample + i];
    }

    // Apply anti-click crossfade at the seam boundary
    if (seamSamples > 0) {
      for (let i = 0; i < seamSamples; i++) {
        const factor = i / seamSamples; // 0 to 1
        const tailIdx = sliceLen - seamSamples + i;
        const headSample = dst[i];
        const tailSample = dst[tailIdx];

        // Equal-power blend
        const gainHead = Math.sin(factor * Math.PI * 0.5);
        const gainTail = Math.cos(factor * Math.PI * 0.5);

        // Blend tail into head
        dst[i] = headSample * gainHead + tailSample * gainTail;
      }
    }
  }

  return slice;
}

// Continuous Loop Playback Engine
function startLoopPlayback() {
  stopLoopPlayback();
  if (!currentBuffer) return;

  const ctx = getAudioContext();
  const seamMs = parseFloat(seamSlider.value) || 0;

  // Use pre-blended slice for zero clicks during loop repeats
  const loopSlice = generateSeamedLoopSlice(currentBuffer, loopIn, loopOut, seamMs);
  if (!loopSlice) return;

  activeSource = ctx.createBufferSource();
  activeSource.buffer = loopSlice;
  activeSource.loop = true;
  activeSource.connect(ctx.destination);

  playbackStartCtxTime = ctx.currentTime;
  activeSource.start(0);
  isPlaying = true;
  loopCycleCount = 0;

  btnLoopPlay.classList.add('btn-playing');
  btnLoopPlay.querySelector('span').textContent = 'Pause Loop';

  function update() {
    if (!isPlaying) return;
    const elapsed = ctx.currentTime - playbackStartCtxTime;
    const dur = loopSlice.duration;
    const currentPlayhead = loopIn + (elapsed % dur);
    const cycle = Math.floor(elapsed / dur);
    badgeLoopCycles.textContent = `Cycle: ${cycle}`;
    renderWaveform(currentPlayhead);
    animFrameId = requestAnimationFrame(update);
  }
  update();
}

function stopLoopPlayback() {
  if (activeSource) {
    try { activeSource.stop(); } catch (_) {}
    activeSource.disconnect();
    activeSource = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animFrameId);
  btnLoopPlay.querySelector('span').textContent = 'Test Seamless Loop';
  renderWaveform(null);
}

btnLoopPlay.addEventListener('click', () => {
  if (isPlaying) {
    stopLoopPlayback();
  } else {
    startLoopPlayback();
  }
});

btnLoopStop.addEventListener('click', () => {
  stopLoopPlayback();
});

// Dropzone & File Handlers
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
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    await setAudioBuffer(decoded);
  } catch (err) {
    alert('Failed to decode audio: ' + err.message);
  }
}

btnLoadDemo.addEventListener('click', () => {
  generateDemoGroove();
});

btnReset.addEventListener('click', () => {
  if (confirm('Reset loop editor workspace?')) {
    stopLoopPlayback();
    currentBuffer = null;
    fileMetaBadges.style.display = 'none';
    btnReset.style.display = 'none';
    studioWorkspace.style.display = 'none';
    exportPanel.style.display = 'none';
    audioInput.value = '';
  }
});

// Export Looped WAV
btnExportLoop.addEventListener('click', () => {
  if (!currentBuffer) return;

  btnExportLoop.disabled = true;
  btnExportLoop.innerHTML = 'Rendering Looped Audio...';

  setTimeout(() => {
    try {
      const seamMs = parseFloat(seamSlider.value) || 0;
      const repeats = parseInt(selectRepeats.value, 10) || 1;

      const singleSlice = generateSeamedLoopSlice(currentBuffer, loopIn, loopOut, seamMs);
      if (!singleSlice) throw new Error('Could not slice audio loop.');

      const ctx = getAudioContext();
      const numChannels = singleSlice.numberOfChannels;
      const sampleRate = singleSlice.sampleRate;
      const totalLen = singleSlice.length * repeats;

      const exportedBuffer = ctx.createBuffer(numChannels, totalLen, sampleRate);
      for (let c = 0; c < numChannels; c++) {
        const src = singleSlice.getChannelData(c);
        const dst = exportedBuffer.getChannelData(c);
        for (let r = 0; r < repeats; r++) {
          dst.set(src, r * singleSlice.length);
        }
      }

      const wavBlob = audioBufferToWavBlob(exportedBuffer);
      const url = URL.createObjectURL(wavBlob);

      exportAudio.src = url;
      btnDownloadLoop.href = url;
      const baseName = currentFileName.replace(/\.[^/.]+$/, '');
      btnDownloadLoop.download = `${baseName}_loop_${repeats}x.wav`;

      exportDetails.textContent = `${formatTime(exportedBuffer.duration)} • ${repeats}x Repeats • ${formatBytes(wavBlob.size)}`;
      exportPanel.style.display = 'block';
      exportPanel.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert('Failed to export loop: ' + err.message);
    } finally {
      btnExportLoop.disabled = false;
      btnExportLoop.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <span>Export Looped Audio (.WAV)</span>
      `;
    }
  }, 40);
});

window.addEventListener('resize', () => {
  renderWaveform();
});