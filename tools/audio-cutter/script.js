// Audio Cutter & Waveform Trimmer - ALL IN ONE

let audioCtx = null;
let currentBuffer = null;
let currentFileName = 'audio_clip';
let currentFileSize = 0;

// Trimming & Playback State
let startTime = 0;
let endTime = 0;
let duration = 0;
let isPlaying = false;
let activeSourceNode = null;
let gainNode = null;
let playbackStartCtxTime = 0;
let playbackOffset = 0;
let playbackRange = { start: 0, end: 0 };
let animFrameId = null;
let zoomLevel = 1.0;

// Interaction State
let isDraggingStart = false;
let isDraggingEnd = false;
let isScrubbing = false;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('audio-file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const studioPanel = document.getElementById('studio-panel');

const fileTitle = document.getElementById('file-title');
const tagDuration = document.getElementById('tag-duration');
const tagRate = document.getElementById('tag-rate');
const tagChannels = document.getElementById('tag-channels');
const tagSize = document.getElementById('tag-size');

const canvasWrapper = document.getElementById('canvas-wrapper');
const waveformCanvas = document.getElementById('waveform-canvas');
const overlayCanvas = document.getElementById('overlay-canvas');
const tickStart = document.getElementById('tick-start');
const tickMid = document.getElementById('tick-mid');
const tickEnd = document.getElementById('tick-end');

const btnPlaySelection = document.getElementById('btn-play-selection');
const btnPlayAll = document.getElementById('btn-play-all');
const btnStop = document.getElementById('btn-stop');
const checkLoop = document.getElementById('check-loop');
const volumeSlider = document.getElementById('volume-slider');
const readoutCurrent = document.getElementById('readout-current');
const readoutTotal = document.getElementById('readout-total');

const inputStartSec = document.getElementById('input-start-sec');
const inputEndSec = document.getElementById('input-end-sec');
const btnStartToCurrent = document.getElementById('btn-start-to-current');
const btnEndToCurrent = document.getElementById('btn-end-to-current');

const checkFadeIn = document.getElementById('check-fade-in');
const inputFadeInDur = document.getElementById('input-fade-in-dur');
const checkFadeOut = document.getElementById('check-fade-out');
const inputFadeOutDur = document.getElementById('input-fade-out-dur');

const selectionDurationText = document.getElementById('selection-duration-text');
const btnPreviewCut = document.getElementById('btn-preview-cut');
const btnDownloadWav = document.getElementById('btn-download-wav');

const exportPreviewContainer = document.getElementById('export-preview-container');
const exportFileMeta = document.getElementById('export-file-meta');
const exportAudioElement = document.getElementById('export-audio-element');

const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnZoomReset = document.getElementById('btn-zoom-reset');

// Initialize Web Audio Context
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = parseFloat(volumeSlider.value) || 0.9;
    gainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Format seconds into MM:SS.mmm
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

// Generate built-in rich demo sound using Web Audio API synthesis
async function generateDemoAudioBuffer() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const demoDuration = 6.0;
  const numSamples = Math.floor(sampleRate * demoDuration);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Synthesize a pleasant polyphonic melodic chord progression
  // Chords: Cmaj7, Am7, Fmaj7, G7 with gentle arpeggio
  const chords = [
    [261.63, 329.63, 392.00, 493.88], // C E G B
    [220.00, 261.63, 329.63, 392.00], // A C E G
    [174.61, 220.00, 261.63, 329.63], // F A C E
    [196.00, 246.94, 293.66, 349.23]  // G B D F
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor((t / demoDuration) * chords.length) % chords.length;
    const chord = chords[chordIndex];

    let sampleL = 0;
    let sampleR = 0;

    // Bass note
    const bassFreq = chord[0] / 2;
    sampleL += 0.22 * Math.sin(2 * Math.PI * bassFreq * t);
    sampleR += 0.22 * Math.sin(2 * Math.PI * bassFreq * t);

    // Arpeggiated chime
    chord.forEach((freq, idx) => {
      const noteTime = (t * 4 + idx * 0.25) % 1;
      const env = Math.exp(-noteTime * 4.5);
      const tone = Math.sin(2 * Math.PI * freq * t) * env;
      sampleL += tone * 0.15 * (idx % 2 === 0 ? 1 : 0.4);
      sampleR += tone * 0.15 * (idx % 2 === 1 ? 1 : 0.4);
    });

    // Subtle gentle vinyl crackle / tape ambience
    const noise = (Math.random() * 2 - 1) * 0.003;
    sampleL += noise;
    sampleR += noise;

    left[i] = Math.max(-0.95, Math.min(0.95, sampleL));
    right[i] = Math.max(-0.95, Math.min(0.95, sampleR));
  }

  return buffer;
}

// Decode audio file from ArrayBuffer
async function loadAudioBuffer(arrayBuffer, name, size) {
  const ctx = getAudioContext();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    setAudioData(decoded, name, size);
  } catch (err) {
    alert('Unable to decode audio format. Please try an MP3, WAV, AAC, or OGG file.');
    console.error('Audio decode error:', err);
  }
}

// Set active audio data & setup UI
function setAudioData(buffer, name, size) {
  currentBuffer = buffer;
  currentFileName = name || 'audio_file';
  currentFileSize = size || 0;
  duration = buffer.duration;

  // Set default trim range (e.g., 0s to 80% or full)
  startTime = 0;
  endTime = duration;

  // Update UI Elements
  fileTitle.textContent = currentFileName;
  tagDuration.textContent = `Duration: ${formatTime(duration)}`;
  tagRate.textContent = `Sample Rate: ${(buffer.sampleRate / 1000).toFixed(1)} kHz`;
  tagChannels.textContent = buffer.numberOfChannels === 1 ? 'Mono (1 Ch)' : 'Stereo (2 Ch)';
  tagSize.textContent = size ? `Size: ${formatBytes(size)}` : `RAM: ${formatBytes(buffer.length * buffer.numberOfChannels * 4)}`;

  inputStartSec.max = duration.toFixed(2);
  inputEndSec.max = duration.toFixed(2);
  inputStartSec.value = '0.00';
  inputEndSec.value = duration.toFixed(2);

  tickStart.textContent = '0:00.0';
  tickMid.textContent = formatTime(duration / 2);
  tickEnd.textContent = formatTime(duration);

  readoutTotal.textContent = formatTime(duration);
  updateSelectionSummary();

  studioPanel.style.display = 'flex';
  exportPreviewContainer.style.display = 'none';

  resizeCanvases();
  renderWaveform();
  renderOverlay();
}

// Resize canvases to pixel density
function resizeCanvases() {
  const rect = canvasWrapper.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(300, Math.floor(rect.width));
  const height = Math.max(120, Math.floor(rect.height || 180));

  waveformCanvas.width = width * dpr;
  waveformCanvas.height = height * dpr;
  overlayCanvas.width = width * dpr;
  overlayCanvas.height = height * dpr;

  const ctxWave = waveformCanvas.getContext('2d');
  const ctxOver = overlayCanvas.getContext('2d');
  ctxWave.resetTransform ? ctxWave.resetTransform() : ctxWave.setTransform(1, 0, 0, 1, 0, 0);
  ctxOver.resetTransform ? ctxOver.resetTransform() : ctxOver.setTransform(1, 0, 0, 1, 0, 0);
  ctxWave.scale(dpr, dpr);
  ctxOver.scale(dpr, dpr);
}

// Render audio waveform on main canvas
function renderWaveform() {
  if (!currentBuffer) return;
  const width = canvasWrapper.clientWidth;
  const height = canvasWrapper.clientHeight;
  const ctx = waveformCanvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  // Background subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Waveform peak extraction
  const numChannels = currentBuffer.numberOfChannels;
  const step = Math.ceil(currentBuffer.length / width);
  const amp = height / 2;

  // Modern gradient for waveform
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#4e85bf');
  gradient.addColorStop(0.5, '#72a0c1');
  gradient.addColorStop(1, '#89aacc');

  ctx.fillStyle = gradient;

  for (let x = 0; x < width; x++) {
    const startSample = Math.floor(x * step);
    const endSample = Math.min(startSample + step, currentBuffer.length);
    let min = 1.0;
    let max = -1.0;

    for (let c = 0; c < numChannels; c++) {
      const channelData = currentBuffer.getChannelData(c);
      for (let s = startSample; s < endSample; s += 4) { // stride for speed
        const val = channelData[s];
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }

    if (min > max) {
      min = 0;
      max = 0;
    }

    const yMin = (1 + min) * amp;
    const yMax = (1 + max) * amp;
    const barHeight = Math.max(2, yMax - yMin);

    ctx.fillRect(x, yMin, 1.2, barHeight);
  }
}

// Render handles, dimmed regions, and playhead on overlay canvas
function renderOverlay() {
  if (!currentBuffer || duration <= 0) return;
  const width = canvasWrapper.clientWidth;
  const height = canvasWrapper.clientHeight;
  const ctx = overlayCanvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  const startX = (startTime / duration) * width;
  const endX = (endTime / duration) * width;

  // Dim left excluded region
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, startX, height);

  // Dim right excluded region
  ctx.fillRect(endX, 0, width - endX, height);

  // Active trim zone border / glow
  ctx.strokeStyle = 'rgba(78, 133, 191, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(startX, 0, endX - startX, height);

  // Start Scrubber Handle (Emerald Green)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(startX, 0);
  ctx.lineTo(startX, height);
  ctx.stroke();

  // Start handle top flag
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.moveTo(startX, 0);
  ctx.lineTo(startX + 12, 0);
  ctx.lineTo(startX, 16);
  ctx.closePath();
  ctx.fill();

  // End Scrubber Handle (Coral / Red)
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(endX, 0);
  ctx.lineTo(endX, height);
  ctx.stroke();

  // End handle top flag
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.moveTo(endX, 0);
  ctx.lineTo(endX - 12, 0);
  ctx.lineTo(endX, 16);
  ctx.closePath();
  ctx.fill();

  // Playhead line
  if (isPlaying) {
    const currentPlayTime = getCurrentPlaybackTime();
    const playX = (currentPlayTime / duration) * width;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#4e85bf';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(playX, 0);
    ctx.lineTo(playX, height);
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    readoutCurrent.textContent = formatTime(currentPlayTime);
  }
}

// Current playback time calculator
function getCurrentPlaybackTime() {
  if (!isPlaying || !audioCtx) return playbackOffset;
  const elapsed = audioCtx.currentTime - playbackStartCtxTime;
  let current = playbackOffset + elapsed;
  if (current >= playbackRange.end) {
    if (checkLoop.checked) {
      // Loop back to start
      startAudioPlayback(playbackRange.start, playbackRange.end);
      return playbackRange.start;
    } else {
      stopPlayback();
      return playbackRange.start;
    }
  }
  return current;
}

// Playback Trigger
function startAudioPlayback(startSec, endSec) {
  if (!currentBuffer) return;
  stopPlayback();

  const ctx = getAudioContext();
  playbackRange = { start: startSec, end: endSec };
  playbackOffset = startSec;
  playbackStartCtxTime = ctx.currentTime;

  activeSourceNode = ctx.createBufferSource();
  activeSourceNode.buffer = currentBuffer;
  activeSourceNode.connect(gainNode);

  const durationToPlay = endSec - startSec;
  activeSourceNode.start(0, startSec, durationToPlay);
  isPlaying = true;

  btnPlaySelection.classList.add('btn-primary');
  btnPlaySelection.querySelector('span').textContent = 'Pause';

  function step() {
    if (!isPlaying) return;
    renderOverlay();
    animFrameId = requestAnimationFrame(step);
  }
  animFrameId = requestAnimationFrame(step);

  activeSourceNode.onended = () => {
    if (isPlaying && !checkLoop.checked) {
      stopPlayback();
    }
  };
}

function stopPlayback() {
  if (activeSourceNode) {
    try {
      activeSourceNode.stop();
      activeSourceNode.disconnect();
    } catch (e) {
      // ignore already stopped
    }
    activeSourceNode = null;
  }
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  isPlaying = false;
  btnPlaySelection.querySelector('span').textContent = 'Play Selection';
  readoutCurrent.textContent = formatTime(startTime);
  renderOverlay();
}

// Selection Duration Text and Input Synchronization
function updateSelectionSummary() {
  const selDuration = Math.max(0, endTime - startTime);
  selectionDurationText.textContent = `${formatTime(selDuration)} (${(selDuration).toFixed(3)}s)`;
}

function syncInputsFromVariables() {
  inputStartSec.value = startTime.toFixed(3);
  inputEndSec.value = endTime.toFixed(3);
  updateSelectionSummary();
  renderOverlay();
}

// Canvas Mouse / Touch Scrubbing Interaction
function getTimeFromClientX(clientX) {
  const rect = canvasWrapper.getBoundingClientRect();
  const relX = Math.max(0, Math.min(clientX - rect.left, rect.width));
  return (relX / rect.width) * duration;
}

function onPointerDown(e) {
  if (!currentBuffer) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const rect = canvasWrapper.getBoundingClientRect();
  const relX = clientX - rect.left;
  const clickTime = (relX / rect.width) * duration;

  const startX = (startTime / duration) * rect.width;
  const endX = (endTime / duration) * rect.width;

  const hitTolerance = 14;

  if (Math.abs(relX - startX) <= hitTolerance) {
    isDraggingStart = true;
  } else if (Math.abs(relX - endX) <= hitTolerance) {
    isDraggingEnd = true;
  } else {
    // Clicked in waveform - reposition closest handle or move playhead
    if (clickTime < startTime) {
      startTime = Math.max(0, clickTime);
      isDraggingStart = true;
    } else if (clickTime > endTime) {
      endTime = Math.min(duration, clickTime);
      isDraggingEnd = true;
    } else {
      // Clicked inside selected range
      if (Math.abs(clickTime - startTime) < Math.abs(clickTime - endTime)) {
        startTime = clickTime;
        isDraggingStart = true;
      } else {
        endTime = clickTime;
        isDraggingEnd = true;
      }
    }
  }

  syncInputsFromVariables();
  e.preventDefault();
}

function onPointerMove(e) {
  if (!currentBuffer) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const t = getTimeFromClientX(clientX);

  if (isDraggingStart) {
    startTime = Math.max(0, Math.min(t, endTime - 0.05));
    syncInputsFromVariables();
  } else if (isDraggingEnd) {
    endTime = Math.min(duration, Math.max(t, startTime + 0.05));
    syncInputsFromVariables();
  }
}

function onPointerUp() {
  isDraggingStart = false;
  isDraggingEnd = false;
}

// Event Listeners for Canvas Interaction
canvasWrapper.addEventListener('mousedown', onPointerDown);
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('mouseup', onPointerUp);

canvasWrapper.addEventListener('touchstart', onPointerDown, { passive: false });
window.addEventListener('touchmove', onPointerMove, { passive: false });
window.addEventListener('touchend', onPointerUp);

// Window Resize Observer for Responsive Canvas
window.addEventListener('resize', () => {
  if (currentBuffer) {
    resizeCanvases();
    renderWaveform();
    renderOverlay();
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

function handleAudioFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    loadAudioBuffer(e.target.result, file.name, file.size);
  };
  reader.readAsArrayBuffer(file);
}

// Load Demo Melody Handler
btnLoadDemo.addEventListener('click', async () => {
  const demoBuf = await generateDemoAudioBuffer();
  setAudioData(demoBuf, 'Demo_Synth_Melody.wav', demoBuf.length * 4);
});

// Play / Pause Buttons
btnPlaySelection.addEventListener('click', () => {
  if (isPlaying) {
    stopPlayback();
  } else {
    startAudioPlayback(startTime, endTime);
  }
});

btnPlayAll.addEventListener('click', () => {
  if (isPlaying) stopPlayback();
  startAudioPlayback(0, duration);
});

btnStop.addEventListener('click', () => {
  stopPlayback();
});

volumeSlider.addEventListener('input', (e) => {
  if (gainNode) {
    gainNode.gain.value = parseFloat(e.target.value);
  }
});

// Input fine-tuning changes
inputStartSec.addEventListener('input', (e) => {
  let val = parseFloat(e.target.value) || 0;
  val = Math.max(0, Math.min(val, endTime - 0.05));
  startTime = val;
  updateSelectionSummary();
  renderOverlay();
});

inputEndSec.addEventListener('input', (e) => {
  let val = parseFloat(e.target.value) || duration;
  val = Math.min(duration, Math.max(val, startTime + 0.05));
  endTime = val;
  updateSelectionSummary();
  renderOverlay();
});

// Stepper buttons
document.getElementById('btn-start-sub-1').addEventListener('click', () => {
  startTime = Math.max(0, startTime - 1.0);
  syncInputsFromVariables();
});
document.getElementById('btn-start-sub-01').addEventListener('click', () => {
  startTime = Math.max(0, startTime - 0.1);
  syncInputsFromVariables();
});
document.getElementById('btn-start-add-01').addEventListener('click', () => {
  startTime = Math.min(endTime - 0.05, startTime + 0.1);
  syncInputsFromVariables();
});
document.getElementById('btn-start-add-1').addEventListener('click', () => {
  startTime = Math.min(endTime - 0.05, startTime + 1.0);
  syncInputsFromVariables();
});

document.getElementById('btn-end-sub-1').addEventListener('click', () => {
  endTime = Math.max(startTime + 0.05, endTime - 1.0);
  syncInputsFromVariables();
});
document.getElementById('btn-end-sub-01').addEventListener('click', () => {
  endTime = Math.max(startTime + 0.05, endTime - 0.1);
  syncInputsFromVariables();
});
document.getElementById('btn-end-add-01').addEventListener('click', () => {
  endTime = Math.min(duration, endTime + 0.1);
  syncInputsFromVariables();
});
document.getElementById('btn-end-add-1').addEventListener('click', () => {
  endTime = Math.min(duration, endTime + 1.0);
  syncInputsFromVariables();
});

btnStartToCurrent.addEventListener('click', () => {
  const current = getCurrentPlaybackTime();
  if (current < endTime - 0.05) {
    startTime = current;
    syncInputsFromVariables();
  }
});

btnEndToCurrent.addEventListener('click', () => {
  const current = getCurrentPlaybackTime();
  if (current > startTime + 0.05) {
    endTime = current;
    syncInputsFromVariables();
  }
});

// Zoom Controls
btnZoomIn.addEventListener('click', () => {
  zoomLevel = Math.min(4.0, zoomLevel + 0.5);
  canvasWrapper.style.width = `${zoomLevel * 100}%`;
  resizeCanvases();
  renderWaveform();
  renderOverlay();
});
btnZoomOut.addEventListener('click', () => {
  zoomLevel = Math.max(1.0, zoomLevel - 0.5);
  canvasWrapper.style.width = `${zoomLevel * 100}%`;
  resizeCanvases();
  renderWaveform();
  renderOverlay();
});
btnZoomReset.addEventListener('click', () => {
  zoomLevel = 1.0;
  canvasWrapper.style.width = '100%';
  resizeCanvases();
  renderWaveform();
  renderOverlay();
});

// Slicing & Processing Audio Buffer
function sliceAndProcessAudioBuffer() {
  if (!currentBuffer) return null;
  const ctx = getAudioContext();
  const sampleRate = currentBuffer.sampleRate;
  const numChannels = currentBuffer.numberOfChannels;

  const startSample = Math.max(0, Math.floor(startTime * sampleRate));
  const endSample = Math.min(currentBuffer.length, Math.floor(endTime * sampleRate));
  const slicedLength = endSample - startSample;

  if (slicedLength <= 0) return null;

  const slicedBuffer = ctx.createBuffer(numChannels, slicedLength, sampleRate);

  const applyFadeIn = checkFadeIn.checked;
  const fadeInSec = parseFloat(inputFadeInDur.value) || 0.5;
  const fadeInSamples = Math.floor(fadeInSec * sampleRate);

  const applyFadeOut = checkFadeOut.checked;
  const fadeOutSec = parseFloat(inputFadeOutDur.value) || 0.5;
  const fadeOutSamples = Math.floor(fadeOutSec * sampleRate);

  for (let c = 0; c < numChannels; c++) {
    const sourceData = currentBuffer.getChannelData(c);
    const targetData = slicedBuffer.getChannelData(c);

    for (let i = 0; i < slicedLength; i++) {
      let sample = sourceData[startSample + i];

      // Apply Fade In
      if (applyFadeIn && i < fadeInSamples && fadeInSamples > 0) {
        sample *= (i / fadeInSamples);
      }

      // Apply Fade Out
      if (applyFadeOut && (slicedLength - 1 - i) < fadeOutSamples && fadeOutSamples > 0) {
        sample *= ((slicedLength - 1 - i) / fadeOutSamples);
      }

      targetData[i] = sample;
    }
  }

  return slicedBuffer;
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

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt Subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data Subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave and write samples
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

// Preview Trimmed Result Handler
btnPreviewCut.addEventListener('click', () => {
  const sliced = sliceAndProcessAudioBuffer();
  if (!sliced) return;

  const wavBlob = audioBufferToWavBlob(sliced);
  const blobUrl = URL.createObjectURL(wavBlob);

  exportAudioElement.src = blobUrl;
  exportFileMeta.textContent = `WAV 16-bit PCM • ${formatBytes(wavBlob.size)} • ${formatTime(sliced.duration)}`;
  exportPreviewContainer.style.display = 'flex';
  exportAudioElement.play();
});

// Download Trimmed WAV Handler
btnDownloadWav.addEventListener('click', () => {
  const sliced = sliceAndProcessAudioBuffer();
  if (!sliced) return;

  const wavBlob = audioBufferToWavBlob(sliced);
  const blobUrl = URL.createObjectURL(wavBlob);

  const cleanName = currentFileName.replace(/\.[^/.]+$/, '');
  const outFileName = `trimmed_${cleanName}.wav`;

  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = outFileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Also show inline preview player
  exportAudioElement.src = blobUrl;
  exportFileMeta.textContent = `WAV 16-bit PCM • ${formatBytes(wavBlob.size)} • ${formatTime(sliced.duration)}`;
  exportPreviewContainer.style.display = 'flex';
});