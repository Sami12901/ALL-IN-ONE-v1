// Audio Pitch Changer - Musical Pitch Shifter Without Changing Speed
// Client-side Web Audio DSP with SOLA Time-Stretching & Resampling

let audioCtx = null;
let originalBuffer = null;
let processedBuffer = null;
let currentFileName = 'audio_track';
let currentFileSize = 0;

// Playback state
let sourceNode = null;
let gainNode = null;
let isPlaying = false;
let startTime = 0;
let pauseOffset = 0;
let animFrameId = null;
let debounceTimeout = null;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const btnBrowseFile = document.getElementById('btn-browse-file');
const fileInput = document.getElementById('audio-file-input');
const btnDemoSound = document.getElementById('btn-demo-sound');
const studioWorkspace = document.getElementById('studio-workspace');
const btnReplaceTrack = document.getElementById('btn-replace-track');

const trackName = document.getElementById('track-name');
const badgeDuration = document.getElementById('badge-duration');
const badgeSamplerate = document.getElementById('badge-samplerate');
const badgeChannels = document.getElementById('badge-channels');
const badgeSize = document.getElementById('badge-size');

const heroPitchVal = document.getElementById('hero-pitch-val');
const heroPitchRatio = document.getElementById('hero-pitch-ratio');
const semitoneSlider = document.getElementById('semitone-slider');
const semitoneVal = document.getElementById('semitone-val');
const centsSlider = document.getElementById('cents-slider');
const centsVal = document.getElementById('cents-val');
const presetPills = document.querySelectorAll('.preset-pill');

const waveformWrapper = document.getElementById('waveform-wrapper');
const waveformCanvas = document.getElementById('waveform-canvas');
const playbackOverlay = document.getElementById('playback-overlay');
const processingBadge = document.getElementById('processing-badge');

const btnPlayPause = document.getElementById('btn-play-pause');
const playBtnLabel = document.getElementById('play-btn-label');
const btnStop = document.getElementById('btn-stop');
const timelineSlider = document.getElementById('timeline-slider');
const timeDisplay = document.getElementById('time-display');
const checkLoop = document.getElementById('check-loop');
const volumeSlider = document.getElementById('volume-slider');

const btnDownloadWav = document.getElementById('btn-download-wav');
const exportStatus = document.getElementById('export-status');
const exportResult = document.getElementById('export-result');
const exportFileMeta = document.getElementById('export-file-meta');
const exportAudioPlayer = document.getElementById('export-audio-player');
const btnDirectDownload = document.getElementById('btn-direct-download');

// Audio Context Getter
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

// Calculate pitch shift factor
function getPitchRatio() {
  const semitones = parseFloat(semitoneSlider.value) || 0;
  const cents = parseFloat(centsSlider.value) || 0;
  const totalSemitones = semitones + (cents / 100);
  return Math.pow(2, totalSemitones / 12);
}

// Update UI Text & Hero Display
function updatePitchDisplay() {
  const semitones = parseInt(semitoneSlider.value, 10);
  const cents = parseInt(centsSlider.value, 10);
  const ratio = getPitchRatio();

  const sign = semitones > 0 ? '+' : '';
  semitoneVal.textContent = `${sign}${semitones} ST`;
  centsVal.textContent = `${cents > 0 ? '+' : ''}${cents} cents`;

  let heroText = `${sign}${semitones} ST`;
  if (cents !== 0) {
    heroText += ` ${cents > 0 ? '+' : ''}${cents}c`;
  }
  heroPitchVal.textContent = heroText;
  heroPitchRatio.textContent = `Pitch Ratio: ${ratio.toFixed(3)}x • Playback Speed: 100% (Unaltered)`;

  // Update preset pill active states
  presetPills.forEach((p) => {
    const pSt = parseInt(p.dataset.semitones, 10);
    if (pSt === semitones && cents === 0) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  schedulePitchProcessing();
}

// Preset Pills
presetPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    semitoneSlider.value = pill.dataset.semitones;
    centsSlider.value = 0;
    updatePitchDisplay();
  });
});

semitoneSlider.addEventListener('input', updatePitchDisplay);
centsSlider.addEventListener('input', updatePitchDisplay);

// DSP Algorithm: SOLA Time-Stretch
function processSolaTimeStretch(sourceBuffer, speed) {
  if (Math.abs(speed - 1.0) < 0.001) return sourceBuffer;

  const ctx = getAudioContext();
  const numChannels = sourceBuffer.numberOfChannels;
  const sampleRate = sourceBuffer.sampleRate;
  const origLength = sourceBuffer.length;
  const targetLength = Math.max(1, Math.round(origLength / speed));

  const windowSize = 2048;
  const synthHop = 512;
  const maxOffset = 256;

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

  while (synthPos + windowSize < targetLength && analysisPos + windowSize + maxOffset < origLength) {
    let bestOffset = 0;
    if (synthPos > 0) {
      let maxCorr = -Infinity;
      const src0 = inChannels[0];
      const out0 = outChannels[0];

      for (let offset = -maxOffset; offset <= maxOffset; offset += 4) {
        const candidatePos = analysisPos + offset;
        if (candidatePos < 0 || candidatePos + windowSize >= origLength) continue;

        let corr = 0;
        for (let j = 0; j < synthHop; j += 4) {
          corr += out0[synthPos + j] * src0[candidatePos + j];
        }

        if (corr > maxCorr) {
          maxCorr = corr;
          bestOffset = offset;
        }
      }
    }

    const alignedPos = Math.max(0, Math.min(origLength - windowSize, analysisPos + bestOffset));

    for (let i = 0; i < windowSize; i++) {
      const outIdx = synthPos + i;
      const w = windowArr[i];
      overlapWeights[outIdx] += w;

      for (let c = 0; c < numChannels; c++) {
        outChannels[c][outIdx] += inChannels[c][alignedPos + i] * w;
      }
    }

    synthPos += synthHop;
    analysisPos = Math.round(synthPos * speed);
  }

  for (let i = 0; i < targetLength; i++) {
    const w = overlapWeights[i];
    if (w > 0.001) {
      for (let c = 0; c < numChannels; c++) {
        outChannels[c][i] /= w;
      }
    }
  }

  return targetBuffer;
}

// DSP Algorithm: Linear Interpolation Resampling
function resampleBuffer(sourceBuffer, rate, exactTargetLength = null) {
  const ctx = getAudioContext();
  const numChannels = sourceBuffer.numberOfChannels;
  const sampleRate = sourceBuffer.sampleRate;
  const origLength = sourceBuffer.length;
  const newLength = exactTargetLength || Math.max(1, Math.round(origLength / rate));

  const targetBuffer = ctx.createBuffer(numChannels, newLength, sampleRate);

  for (let c = 0; c < numChannels; c++) {
    const src = sourceBuffer.getChannelData(c);
    const dst = targetBuffer.getChannelData(c);

    for (let i = 0; i < newLength; i++) {
      const srcIdx = i * rate;
      const idxFloor = Math.floor(srcIdx);
      const frac = srcIdx - idxFloor;

      if (idxFloor + 1 < origLength) {
        dst[i] = src[idxFloor] * (1 - frac) + src[idxFloor + 1] * frac;
      } else if (idxFloor < origLength) {
        dst[i] = src[idxFloor];
      } else {
        dst[i] = 0;
      }
    }
  }

  return targetBuffer;
}

// Perform Pitch Shift Without Changing Speed
function shiftPitchWithoutSpeedChange(buffer, pitchRatio) {
  if (Math.abs(pitchRatio - 1.0) < 0.001) {
    return buffer;
  }

  // Step 1: Time stretch by 1 / pitchRatio
  // e.g. If pitch ratio is 1.5, speed factor is 1/1.5, stretching length to L * 1.5
  const speedFactor = 1.0 / pitchRatio;
  const stretchedBuffer = processSolaTimeStretch(buffer, speedFactor);

  // Step 2: Resample by pitchRatio to scale frequencies up/down and restore length to original buffer.length
  return resampleBuffer(stretchedBuffer, pitchRatio, buffer.length);
}

// Debounce & apply pitch shift
function schedulePitchProcessing() {
  if (!originalBuffer) return;
  processingBadge.textContent = 'Recalculating...';
  processingBadge.style.color = 'var(--warning)';

  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    applyPitchShift();
  }, 120);
}

function applyPitchShift() {
  if (!originalBuffer) return;
  const ratio = getPitchRatio();
  const wasPlaying = isPlaying;
  const currPos = pauseOffset;

  try {
    processedBuffer = shiftPitchWithoutSpeedChange(originalBuffer, ratio);
    renderWaveform();
    processingBadge.textContent = 'Shift Applied';
    processingBadge.style.color = 'var(--success)';

    if (wasPlaying) {
      playAudio(currPos);
    }
  } catch (err) {
    console.error('Pitch shifting error:', err);
    processingBadge.textContent = 'Error';
    processingBadge.style.color = 'var(--error)';
  }
}

// Audio Player Transport
function playAudio(offset = 0) {
  if (!processedBuffer) return;
  const ctx = getAudioContext();

  if (isPlaying) {
    stopAudio(false);
  }

  sourceNode = ctx.createBufferSource();
  sourceNode.buffer = processedBuffer;
  sourceNode.loop = checkLoop.checked;

  gainNode = ctx.createGain();
  gainNode.gain.value = parseFloat(volumeSlider.value);

  sourceNode.connect(gainNode);
  gainNode.connect(ctx.destination);

  sourceNode.onended = () => {
    if (isPlaying && !checkLoop.checked) {
      stopAudio(true);
    }
  };

  offset = Math.max(0, Math.min(offset, processedBuffer.duration));
  sourceNode.start(0, offset);

  startTime = ctx.currentTime - offset;
  pauseOffset = offset;
  isPlaying = true;
  playBtnLabel.textContent = '❚❚ Pause';

  startTimelineLoop();
}

function pauseAudio() {
  if (!isPlaying) return;
  const ctx = getAudioContext();
  pauseOffset = (ctx.currentTime - startTime) % processedBuffer.duration;
  if (sourceNode) {
    try { sourceNode.stop(); } catch (e) {}
    sourceNode.disconnect();
    sourceNode = null;
  }
  isPlaying = false;
  playBtnLabel.textContent = '▶ Play';
}

function stopAudio(resetTimeline = true) {
  if (sourceNode) {
    try { sourceNode.stop(); } catch (e) {}
    sourceNode.disconnect();
    sourceNode = null;
  }
  isPlaying = false;
  playBtnLabel.textContent = '▶ Play';

  if (resetTimeline) {
    pauseOffset = 0;
    timelineSlider.value = 0;
    timeDisplay.textContent = `00:00.00 / ${formatTime(processedBuffer ? processedBuffer.duration : 0)}`;
    playbackOverlay.style.width = '0%';
  }
}

btnPlayPause.addEventListener('click', () => {
  if (!processedBuffer) return;
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio(pauseOffset);
  }
});

btnStop.addEventListener('click', () => stopAudio(true));

checkLoop.addEventListener('change', () => {
  if (sourceNode) {
    sourceNode.loop = checkLoop.checked;
  }
});

volumeSlider.addEventListener('input', () => {
  if (gainNode && audioCtx) {
    gainNode.gain.setTargetAtTime(parseFloat(volumeSlider.value), audioCtx.currentTime, 0.02);
  }
});

// Timeline slider scrub
timelineSlider.addEventListener('input', () => {
  if (!processedBuffer) return;
  const targetTime = (parseFloat(timelineSlider.value) / 100) * processedBuffer.duration;
  pauseOffset = targetTime;
  timeDisplay.textContent = `${formatTime(targetTime)} / ${formatTime(processedBuffer.duration)}`;
  playbackOverlay.style.width = `${timelineSlider.value}%`;
  if (isPlaying) {
    playAudio(targetTime);
  }
});

// Waveform click-to-seek
waveformWrapper.addEventListener('click', (e) => {
  if (!processedBuffer) return;
  const rect = waveformWrapper.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, clickX / rect.width));
  const targetTime = pct * processedBuffer.duration;
  pauseOffset = targetTime;
  timelineSlider.value = pct * 100;
  playbackOverlay.style.width = `${pct * 100}%`;
  timeDisplay.textContent = `${formatTime(targetTime)} / ${formatTime(processedBuffer.duration)}`;
  if (isPlaying) {
    playAudio(targetTime);
  }
});

function startTimelineLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  function loop() {
    if (isPlaying && processedBuffer && audioCtx) {
      let currentPos = (audioCtx.currentTime - startTime);
      if (checkLoop.checked) {
        currentPos = currentPos % processedBuffer.duration;
      } else if (currentPos > processedBuffer.duration) {
        currentPos = processedBuffer.duration;
      }
      pauseOffset = currentPos;
      const pct = (currentPos / processedBuffer.duration) * 100;
      timelineSlider.value = pct;
      playbackOverlay.style.width = `${pct}%`;
      timeDisplay.textContent = `${formatTime(currentPos)} / ${formatTime(processedBuffer.duration)}`;
      animFrameId = requestAnimationFrame(loop);
    }
  }

  loop();
}

// Render Waveform Canvas
function renderWaveform() {
  if (!waveformCanvas || !processedBuffer) return;
  const ctx = waveformCanvas.getContext('2d');
  const width = waveformCanvas.width;
  const height = waveformCanvas.height;

  ctx.clearRect(0, 0, width, height);

  // Background grid
  ctx.fillStyle = 'rgba(8, 12, 18, 0.9)';
  ctx.fillRect(0, 0, width, height);

  const channelData = processedBuffer.getChannelData(0);
  const step = Math.ceil(channelData.length / width);
  const amp = height / 2;

  ctx.fillStyle = '#4e85bf';

  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;
    const startIdx = i * step;

    for (let j = 0; j < step; j++) {
      const datum = channelData[startIdx + j] || 0;
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }

    const yMin = (1 + min) * amp;
    const yMax = Math.max(yMin + 1, (1 + max) * amp);

    ctx.fillRect(i, yMin, 1, yMax - yMin);
  }
}

function resizeWaveformCanvas() {
  if (!waveformCanvas) return;
  const rect = waveformWrapper.getBoundingClientRect();
  waveformCanvas.width = rect.width * (window.devicePixelRatio || 1);
  waveformCanvas.height = rect.height * (window.devicePixelRatio || 1);
  renderWaveform();
}
window.addEventListener('resize', resizeWaveformCanvas);

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

// Download Pitch-Shifted WAV
let activeExportUrl = null;

btnDownloadWav.addEventListener('click', async () => {
  if (!processedBuffer) return;

  try {
    btnDownloadWav.disabled = true;
    exportStatus.textContent = 'Compiling 16-bit PCM WAV...';
    await new Promise((r) => setTimeout(r, 20));

    const wavBlob = bufferToWavBlob(processedBuffer);

    if (activeExportUrl) {
      URL.revokeObjectURL(activeExportUrl);
    }
    activeExportUrl = URL.createObjectURL(wavBlob);

    const semitones = parseInt(semitoneSlider.value, 10);
    const sign = semitones >= 0 ? `+${semitones}` : `${semitones}`;
    const downloadName = `${currentFileName}_pitch_${sign}st.wav`;

    exportFileMeta.textContent = `WAV 16-bit • ${(processedBuffer.sampleRate / 1000).toFixed(1)} kHz • ${formatBytes(wavBlob.size)}`;
    exportAudioPlayer.src = activeExportUrl;
    btnDirectDownload.href = activeExportUrl;
    btnDirectDownload.download = downloadName;

    exportResult.style.display = 'flex';
    exportStatus.textContent = 'Pitch-shifted WAV ready!';

    // Automatic download
    const link = document.createElement('a');
    link.href = activeExportUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error('WAV export error:', err);
    exportStatus.textContent = 'Export failed: ' + err.message;
  } finally {
    btnDownloadWav.disabled = false;
  }
});

// File Loading
async function loadAudioBuffer(arrayBuffer, name, size) {
  try {
    exportStatus.textContent = 'Decoding audio file...';
    const ctx = getAudioContext();
    const copy = arrayBuffer.slice(0);
    const decoded = await ctx.decodeAudioData(copy);
    setAudioData(decoded, name, size);
  } catch (err) {
    console.error('Decoding error:', err);
    alert('Failed to decode audio file. Please check file format.');
    exportStatus.textContent = 'Decode error.';
  }
}

function setAudioData(buffer, name, size) {
  stopAudio(true);
  originalBuffer = buffer;
  processedBuffer = buffer;
  currentFileName = name.replace(/\.[^/.]+$/, '');
  currentFileSize = size;

  trackName.textContent = name;
  badgeDuration.textContent = formatTime(buffer.duration);
  badgeSamplerate.textContent = `${(buffer.sampleRate / 1000).toFixed(1)} kHz`;
  badgeChannels.textContent = buffer.numberOfChannels === 1 ? 'Mono' : 'Stereo';
  badgeSize.textContent = formatBytes(size);

  timelineSlider.value = 0;
  timeDisplay.textContent = `00:00.00 / ${formatTime(buffer.duration)}`;

  dropZone.style.display = 'none';
  studioWorkspace.style.display = 'flex';
  exportResult.style.display = 'none';
  exportStatus.textContent = '';

  resizeWaveformCanvas();
  updatePitchDisplay();
}

// Built-in Demo Melody Generator
function generateDemoAudioBuffer() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 5.0;
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Arpeggiated melody in C Major: C4, E4, G4, B4, C5
  const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 392.00, 329.63, 261.63];
  const noteDuration = duration / notes.length;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(t / noteDuration) % notes.length;
    const noteTime = t % noteDuration;
    const freq = notes[noteIndex];

    const env = Math.exp(-noteTime * 4.5);
    const sample = (
      Math.sin(2 * Math.PI * freq * noteTime) * 0.6 +
      Math.sin(2 * Math.PI * freq * 2 * noteTime) * 0.25 +
      Math.sin(2 * Math.PI * freq * 3 * noteTime) * 0.1
    ) * env * 0.7;

    left[i] = sample;
    right[i] = sample * 0.95;
  }

  return buffer;
}

// Upload & Demo Events
dropZone.addEventListener('click', (e) => {
  if (e.target !== btnDemoSound) {
    fileInput.click();
  }
});
btnBrowseFile.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});
btnReplaceTrack.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => loadAudioBuffer(e.target.result, file.name, file.size);
  reader.readAsArrayBuffer(file);
}

btnDemoSound.addEventListener('click', (e) => {
  e.stopPropagation();
  exportStatus.textContent = 'Generating acoustic melody demo...';
  const demoBuf = generateDemoAudioBuffer();
  setAudioData(demoBuf, 'Acoustic_Melody_Demo.wav', demoBuf.length * 4);
});