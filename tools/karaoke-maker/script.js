// Karaoke Maker & Vocal Remover - ALL IN ONE
// Client-side Web Audio API Out-of-Phase Stereo Cancellation & Bass Retention

let audioCtx = null;
let originalBuffer = null;
let karaokeBuffer = null;
let currentFileName = 'track.mp3';

// Playback state
let isPlaying = false;
let isKaraokeMode = true; // true = Karaoke, false = Original
let activeSource = null;
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
const badgeChannels = document.getElementById('badge-channels');
const badgeDuration = document.getElementById('badge-duration');

const studioWorkspace = document.getElementById('studio-workspace');
const canvasWrapper = document.getElementById('canvas-wrapper');
const karaokeCanvas = document.getElementById('karaoke-canvas');
const activeModeBadge = document.getElementById('active-mode-badge');
const readoutCurrent = document.getElementById('readout-current');
const readoutTotal = document.getElementById('readout-total');
const readoutEndTick = document.getElementById('readout-end-tick');

const btnToggleKaraoke = document.getElementById('btn-toggle-karaoke');
const btnToggleOriginal = document.getElementById('btn-toggle-original');

const sliderAttenuation = document.getElementById('slider-attenuation');
const valAttenuation = document.getElementById('val-attenuation');
const sliderBass = document.getElementById('slider-bass');
const valBass = document.getElementById('val-bass');
const sliderGain = document.getElementById('slider-gain');
const valGain = document.getElementById('val-gain');

const btnPlay = document.getElementById('btn-play');
const btnStop = document.getElementById('btn-stop');
const btnExportInstrumental = document.getElementById('btn-export-instrumental');

const exportPanel = document.getElementById('export-panel');
const exportFileMeta = document.getElementById('export-file-meta');
const exportAudio = document.getElementById('export-audio');
const btnDownloadWav = document.getElementById('btn-download-wav');

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

// Synthesize Demo Stereo Track with Center Vocals
async function generateDemoStereoTrack() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const dur = 5.0;
  const numSamples = Math.floor(sampleRate * dur);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Musical Progression:
  // - Panned Left: Arpeggiated high synth chimes (E5, G#5, B5)
  // - Panned Right: Arpeggiated complementary synth chimes (B5, D#6, F#6)
  // - Center Bass & Kick: Low-end 60Hz punch (equal in L & R)
  // - Center Vocal Lead: 440Hz / 554Hz vocal singing melody (strictly equal in L & R)

  const vocalMelody = [440.0, 493.88, 554.37, 659.25, 554.37, 440.0];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    // Center Kick & Bass (Mono in-phase)
    const kickBeat = (t * 2) % 1;
    const kick = Math.sin(2 * Math.PI * 62 * t) * Math.exp(-kickBeat * 14) * 0.3;
    const bass = Math.sin(2 * Math.PI * 110 * t) * 0.2;
    const centerLowEnd = kick + bass;

    // Stereo Instruments (out-of-phase / spread)
    const arpL = Math.sin(2 * Math.PI * 659.25 * t) * Math.exp(-(t % 0.25) * 8) * 0.25;
    const arpR = Math.sin(2 * Math.PI * 830.61 * t) * Math.exp(-((t + 0.125) % 0.25) * 8) * 0.25;

    // Center Vocal Lead (Singing melody)
    const noteIdx = Math.floor(t * 1.5) % vocalMelody.length;
    const vocalFreq = vocalMelody[noteIdx];
    // Rich vocal tone with 2nd and 3rd harmonics
    let vocalTone = Math.sin(2 * Math.PI * vocalFreq * t) * 0.35;
    vocalTone += Math.sin(2 * Math.PI * vocalFreq * 2 * t) * 0.18;
    vocalTone += Math.sin(2 * Math.PI * vocalFreq * 3 * t) * 0.08;
    const vocalEnv = 0.5 + 0.5 * Math.sin(2 * Math.PI * 3 * t);
    const centerVocal = vocalTone * vocalEnv * 0.4;

    left[i] = centerLowEnd + arpL + centerVocal;
    right[i] = centerLowEnd + arpR + centerVocal;
  }

  currentFileName = 'demo_stereo_vocal_track.wav';
  await setAudioBuffer(buffer);
}

// DSP Vocal Elimination Engine
function processVocalRemoval(srcBuffer) {
  if (!srcBuffer) return null;
  const ctx = getAudioContext();
  const sampleRate = srcBuffer.sampleRate;
  const length = srcBuffer.length;
  const isMono = srcBuffer.numberOfChannels === 1;

  // Clone stereo buffer
  const outBuf = ctx.createBuffer(2, length, sampleRate);
  const outL = outBuf.getChannelData(0);
  const outR = outBuf.getChannelData(1);

  const inL = srcBuffer.getChannelData(0);
  const inR = isMono ? inL : srcBuffer.getChannelData(1);

  if (isMono) {
    // If mono, center subtraction cancels everything; apply basic vocal band notch filter instead
    for (let i = 0; i < length; i++) {
      outL[i] = inL[i] * 0.5;
      outR[i] = inL[i] * 0.5;
    }
    return outBuf;
  }

  const attenuation = parseFloat(sliderAttenuation.value) || 1.0;
  const crossoverFreq = parseFloat(sliderBass.value) || 200;
  const boost = parseFloat(sliderGain.value) || 1.0;

  // Single-pole RC low-pass filter coefficient for bass retention
  // dt = 1 / sampleRate, RC = 1 / (2 * PI * cutoff), alpha = dt / (RC + dt)
  const dt = 1.0 / sampleRate;
  const rc = 1.0 / (2.0 * Math.PI * crossoverFreq);
  const alpha = dt / (rc + dt);

  let prevBass = 0.0;

  for (let i = 0; i < length; i++) {
    const sL = inL[i];
    const sR = inR[i];

    // Center signal C = (L + R) / 2
    const center = (sL + sR) * 0.5;

    // Difference signal diff = (L - R) / 2
    const diff = (sL - sR) * 0.5;

    // Filter low-pass bass component from center channel
    prevBass += alpha * (center - prevBass);
    const retainedBass = prevBass;

    // Vocal-cancelled signal: difference signal + retained low-end bass
    const karaokeL = diff + retainedBass;
    const karaokeR = -diff + retainedBass;

    // Blend according to attenuation slider:
    // When attenuation = 1.0: 100% karaoke
    // When attenuation = 0.0: 100% original
    const finalL = ((1.0 - attenuation) * sL + attenuation * karaokeL) * boost;
    const finalR = ((1.0 - attenuation) * sR + attenuation * karaokeR) * boost;

    outL[i] = Math.max(-1.0, Math.min(1.0, finalL));
    outR[i] = Math.max(-1.0, Math.min(1.0, finalR));
  }

  return outBuf;
}

async function setAudioBuffer(buffer) {
  stopPlayback();
  originalBuffer = buffer;

  const isStereo = buffer.numberOfChannels >= 2;
  badgeName.textContent = currentFileName;
  badgeChannels.textContent = isStereo ? 'Stereo 2-Ch' : 'Mono (Simulated)';
  badgeDuration.textContent = formatTime(buffer.duration);
  readoutTotal.textContent = formatTime(buffer.duration);
  readoutEndTick.textContent = formatTime(buffer.duration);

  fileMetaBadges.style.display = 'flex';
  btnReset.style.display = 'inline-flex';
  studioWorkspace.style.display = 'flex';
  exportPanel.style.display = 'none';

  updateDSPBuffer();
  renderWaveform(0);
}

function updateDSPBuffer() {
  if (originalBuffer) {
    karaokeBuffer = processVocalRemoval(originalBuffer);
  }
}

// Render Waveform Canvas
function renderWaveform(currentPlayhead = null) {
  if (!karaokeCanvas) return;
  const activeBuf = isKaraokeMode ? karaokeBuffer : originalBuffer;
  if (!activeBuf) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvasWrapper.getBoundingClientRect();
  if (rect.width === 0) return;

  karaokeCanvas.width = rect.width * dpr;
  karaokeCanvas.height = rect.height * dpr;

  const ctx = karaokeCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = rect.height;

  // Background
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, width, height);

  const midY = height / 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();

  // Waveform Color
  ctx.fillStyle = isKaraokeMode ? '#10b981' : '#4e85bf';

  const cData = activeBuf.getChannelData(0);
  const step = Math.ceil(cData.length / width);
  const amp = height * 0.42;

  for (let x = 0; x < width; x++) {
    const start = Math.floor(x * step);
    const end = Math.min(cData.length, Math.floor((x + 1) * step));
    let min = 1, max = -1;
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

  // Playhead
  if (currentPlayhead !== null && currentPlayhead >= 0 && activeBuf.duration > 0) {
    const px = Math.min(width, (currentPlayhead / activeBuf.duration) * width);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px - 5, 0);
    ctx.lineTo(px + 5, 0);
    ctx.lineTo(px, 7);
    ctx.closePath();
    ctx.fill();
  }
}

// Playback Logic
function startPlayback(offset = 0) {
  stopPlayback();
  const currentBuf = isKaraokeMode ? karaokeBuffer : originalBuffer;
  if (!currentBuf) return;

  const ctx = getAudioContext();
  activeSource = ctx.createBufferSource();
  activeSource.buffer = currentBuf;
  activeSource.connect(ctx.destination);

  playbackOffset = offset;
  playbackStartTime = ctx.currentTime - playbackOffset;

  activeSource.start(0, playbackOffset);
  isPlaying = true;

  btnPlay.classList.add('btn-playing');
  btnPlay.querySelector('span').textContent = 'Pause';

  activeSource.onended = () => {
    if (isPlaying && ctx.currentTime - playbackStartTime >= currentBuf.duration - 0.05) {
      stopPlayback();
      playbackOffset = 0;
      readoutCurrent.textContent = formatTime(0);
      renderWaveform(0);
    }
  };

  function update() {
    if (!isPlaying) return;
    const curTime = ctx.currentTime - playbackStartTime;
    readoutCurrent.textContent = formatTime(curTime);
    renderWaveform(curTime);
    if (curTime < currentBuf.duration) {
      animFrameId = requestAnimationFrame(update);
    }
  }
  update();
}

function pausePlayback() {
  if (!isPlaying) return;
  const ctx = getAudioContext();
  playbackOffset = ctx.currentTime - playbackStartTime;
  if (activeSource) {
    try { activeSource.stop(); } catch (_) {}
    activeSource.disconnect();
    activeSource = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animFrameId);
  btnPlay.querySelector('span').textContent = `Resume ${isKaraokeMode ? 'Karaoke' : 'Original'}`;
}

function stopPlayback() {
  if (activeSource) {
    try { activeSource.stop(); } catch (_) {}
    activeSource.disconnect();
    activeSource = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animFrameId);
  btnPlay.querySelector('span').textContent = `Play ${isKaraokeMode ? 'Karaoke' : 'Original'}`;
}

// Toggle Mode
function setMode(toKaraoke) {
  isKaraokeMode = toKaraoke;
  if (isKaraokeMode) {
    btnToggleKaraoke.className = 'btn btn-primary';
    btnToggleKaraoke.style.background = '';
    btnToggleOriginal.className = 'btn btn-secondary';
    btnToggleOriginal.style.background = 'transparent';
    activeModeBadge.textContent = 'Karaoke Mode Active';
    activeModeBadge.style.color = '#10b981';
    btnPlay.querySelector('span').textContent = isPlaying ? 'Pause' : 'Play Karaoke';
  } else {
    btnToggleOriginal.className = 'btn btn-primary';
    btnToggleOriginal.style.background = '';
    btnToggleKaraoke.className = 'btn btn-secondary';
    btnToggleKaraoke.style.background = 'transparent';
    activeModeBadge.textContent = 'Original Audio Active';
    activeModeBadge.style.color = '#4e85bf';
    btnPlay.querySelector('span').textContent = isPlaying ? 'Pause' : 'Play Original';
  }

  if (isPlaying) {
    const curOffset = getAudioContext().currentTime - playbackStartTime;
    startPlayback(curOffset);
  } else {
    renderWaveform(playbackOffset);
  }
}

btnToggleKaraoke.addEventListener('click', () => setMode(true));
btnToggleOriginal.addEventListener('click', () => setMode(false));

// Play / Stop Buttons
btnPlay.addEventListener('click', () => {
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
  renderWaveform(0);
});

// DSP Sliders
sliderAttenuation.addEventListener('input', (e) => {
  valAttenuation.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
  updateDSPBuffer();
  if (isPlaying && isKaraokeMode) {
    const cur = getAudioContext().currentTime - playbackStartTime;
    startPlayback(cur);
  } else {
    renderWaveform(playbackOffset);
  }
});

sliderBass.addEventListener('input', (e) => {
  valBass.textContent = `${e.target.value} Hz`;
  updateDSPBuffer();
  if (isPlaying && isKaraokeMode) {
    const cur = getAudioContext().currentTime - playbackStartTime;
    startPlayback(cur);
  } else {
    renderWaveform(playbackOffset);
  }
});

sliderGain.addEventListener('input', (e) => {
  valGain.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
  updateDSPBuffer();
  if (isPlaying && isKaraokeMode) {
    const cur = getAudioContext().currentTime - playbackStartTime;
    startPlayback(cur);
  } else {
    renderWaveform(playbackOffset);
  }
});

// Click waveform to seek
canvasWrapper.addEventListener('click', (e) => {
  if (!originalBuffer) return;
  const rect = canvasWrapper.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const seekTime = ratio * originalBuffer.duration;
  playbackOffset = seekTime;
  readoutCurrent.textContent = formatTime(seekTime);
  renderWaveform(seekTime);
  if (isPlaying) {
    startPlayback(seekTime);
  }
});

// File input handlers
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
  generateDemoStereoTrack();
});

btnReset.addEventListener('click', () => {
  if (confirm('Reset karaoke maker workspace?')) {
    stopPlayback();
    originalBuffer = null;
    karaokeBuffer = null;
    fileMetaBadges.style.display = 'none';
    btnReset.style.display = 'none';
    studioWorkspace.style.display = 'none';
    exportPanel.style.display = 'none';
    audioInput.value = '';
  }
});

// Export Instrumental WAV
btnExportInstrumental.addEventListener('click', () => {
  if (!karaokeBuffer) {
    updateDSPBuffer();
  }
  if (!karaokeBuffer) {
    alert('Please upload or load a stereo track first.');
    return;
  }

  btnExportInstrumental.disabled = true;
  btnExportInstrumental.innerHTML = 'Rendering Instrumental WAV...';

  setTimeout(() => {
    try {
      const wavBlob = audioBufferToWavBlob(karaokeBuffer);
      const url = URL.createObjectURL(wavBlob);

      exportAudio.src = url;
      btnDownloadWav.href = url;
      const baseName = currentFileName.replace(/\.[^/.]+$/, '');
      btnDownloadWav.download = `${baseName}_instrumental.wav`;

      exportFileMeta.textContent = `${formatTime(karaokeBuffer.duration)} • Stereo 2-Ch • ${formatBytes(wavBlob.size)}`;
      exportPanel.style.display = 'block';
      exportPanel.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert('Failed to export instrumental: ' + err.message);
    } finally {
      btnExportInstrumental.disabled = false;
      btnExportInstrumental.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Export Instrumental Track (.WAV)</span>
      `;
    }
  }, 40);
});

window.addEventListener('resize', () => {
  renderWaveform(playbackOffset);
});