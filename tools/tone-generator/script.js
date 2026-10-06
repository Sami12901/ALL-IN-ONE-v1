// Audio Tone & Frequency Synthesizer - ALL IN ONE

let audioCtx = null;
let masterGain = null;
let masterPan = null;
let analyserNode = null;

// Single Tone Mode Nodes
let singleOsc = null;

// Binaural Beat Mode Nodes
let binauralOscL = null;
let binauralOscR = null;
let pannerL = null;
let pannerR = null;

// Synthesis State
let isRunning = false;
let isMuted = false;
let currentMode = 'single'; // 'single' or 'binaural'
let currentWaveType = 'sine'; // 'sine', 'square', 'sawtooth', 'triangle'
let currentFrequency = 440.0;
let currentVolume = 0.5;
let currentPan = 0.0;

// Binaural State
let binauralCarrier = 210.0;
let binauralBeat = 7.83;

let animFrameId = null;

// DOM Elements
const btnMasterPlay = document.getElementById('btn-master-play');
const textPlayState = document.getElementById('text-play-state');
const iconPlayState = document.getElementById('icon-play-state');
const btnMuteToggle = document.getElementById('btn-mute-toggle');

const modeSingleBtn = document.getElementById('mode-single');
const modeBinauralBtn = document.getElementById('mode-binaural');
const panelSingleMode = document.getElementById('panel-single-mode');
const panelBinauralMode = document.getElementById('panel-binaural-mode');

const hzNumberDisplay = document.getElementById('hz-number-display');
const musicalNoteLabel = document.getElementById('musical-note-label');
const wavelengthLabel = document.getElementById('wavelength-label');

const scopeCanvas = document.getElementById('scope-canvas');
const scopeWrapper = document.getElementById('scope-wrapper');

const waveButtons = document.querySelectorAll('.btn-wave');
const freqSlider = document.getElementById('freq-slider');
const freqInput = document.getElementById('freq-input');
const volumeSlider = document.getElementById('volume-slider');
const volumeValText = document.getElementById('volume-val-text');
const panSlider = document.getElementById('pan-slider');
const panValText = document.getElementById('pan-val-text');

const binauralCarrierSlider = document.getElementById('binaural-carrier-slider');
const binauralBeatSlider = document.getElementById('binaural-beat-slider');
const carrierReadout = document.getElementById('carrier-readout');
const beatReadout = document.getElementById('beat-readout');
const leftEarHz = document.getElementById('left-ear-hz');
const rightEarHz = document.getElementById('right-ear-hz');
const brainwaveCards = document.querySelectorAll('.brainwave-card');

const presetButtons = document.querySelectorAll('.btn-preset');
const exportDurationSelect = document.getElementById('export-duration-select');
const btnExportWav = document.getElementById('btn-export-wav');

// Conversion between slider (0..1000) and Logarithmic Frequency (20..20000 Hz)
function sliderToFreq(val) {
  const minF = 20;
  const maxF = 20000;
  return minF * Math.pow(maxF / minF, val / 1000);
}

function freqToSlider(f) {
  const minF = 20;
  const maxF = 20000;
  const clamped = Math.max(minF, Math.min(maxF, f));
  return (Math.log(clamped / minF) / Math.log(maxF / minF)) * 1000;
}

// Convert Frequency to Musical Note & Wavelength
function calculateMusicalNote(f) {
  if (f <= 0) return { note: '--', wavelength: '--' };

  // Note names
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const midi = 12 * Math.log2(f / 440) + 69;
  const roundedMidi = Math.round(midi);
  const noteIndex = (roundedMidi % 12 + 12) % 12;
  const octave = Math.floor(roundedMidi / 12) - 1;
  const cents = Math.round((midi - roundedMidi) * 100);

  let noteStr = `${noteNames[noteIndex]}${octave}`;
  if (cents > 0) noteStr += ` (+${cents}c)`;
  else if (cents < 0) noteStr += ` (${cents}c)`;

  // Wavelength in air (v = 343 m/s)
  const wavelengthMeters = 343 / f;
  let waveStr = '';
  if (wavelengthMeters >= 1) {
    waveStr = `λ = ${wavelengthMeters.toFixed(2)} m`;
  } else {
    waveStr = `λ = ${(wavelengthMeters * 100).toFixed(1)} cm`;
  }

  return { note: noteStr, wavelength: waveStr };
}

// Get Brainwave category name
function getBrainwaveCategory(diff) {
  if (diff <= 4) return 'Delta (Deep Sleep)';
  if (diff <= 8) return 'Theta (Meditation)';
  if (diff <= 13) return 'Alpha (Relaxed Focus)';
  if (diff <= 30) return 'Beta (Alert Focus)';
  return 'Gamma (Peak Cognition)';
}

// Initialize Web Audio Context & Nodes
function initAudio() {
  if (audioCtx) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime);

  if (audioCtx.createStereoPanner) {
    masterPan = audioCtx.createStereoPanner();
    masterPan.pan.setValueAtTime(currentPan, audioCtx.currentTime);
  }

  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 1024;
  analyserNode.smoothingTimeConstant = 0.8;

  if (masterPan) {
    masterGain.connect(masterPan);
    masterPan.connect(analyserNode);
  } else {
    masterGain.connect(analyserNode);
  }

  analyserNode.connect(audioCtx.destination);
}

// Start Tone Generator
function startTone() {
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (currentMode === 'single') {
    startSingleTone();
  } else {
    startBinauralBeats();
  }

  isRunning = true;
  updatePlayButtonUI();
  startScopeAnimation();
}

// Stop Tone Generator
function stopTone() {
  if (singleOsc) {
    try {
      singleOsc.stop();
      singleOsc.disconnect();
    } catch (e) {
      // ignore
    }
    singleOsc = null;
  }

  if (binauralOscL) {
    try {
      binauralOscL.stop();
      binauralOscL.disconnect();
    } catch (e) {
      // ignore
    }
    binauralOscL = null;
  }

  if (binauralOscR) {
    try {
      binauralOscR.stop();
      binauralOscR.disconnect();
    } catch (e) {
      // ignore
    }
    binauralOscR = null;
  }

  isRunning = false;
  updatePlayButtonUI();
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  renderIdleScope();
}

// Start Single Oscillator
function startSingleTone() {
  if (singleOsc) return;

  singleOsc = audioCtx.createOscillator();
  singleOsc.type = currentWaveType;
  singleOsc.frequency.setValueAtTime(currentFrequency, audioCtx.currentTime);
  singleOsc.connect(masterGain);
  singleOsc.start();
}

// Start Binaural Oscillators
function startBinauralBeats() {
  if (binauralOscL || binauralOscR) return;

  const leftFreq = binauralCarrier;
  const rightFreq = binauralCarrier + binauralBeat;

  binauralOscL = audioCtx.createOscillator();
  binauralOscL.type = currentWaveType;
  binauralOscL.frequency.setValueAtTime(leftFreq, audioCtx.currentTime);

  binauralOscR = audioCtx.createOscillator();
  binauralOscR.type = currentWaveType;
  binauralOscR.frequency.setValueAtTime(rightFreq, audioCtx.currentTime);

  if (audioCtx.createStereoPanner) {
    pannerL = audioCtx.createStereoPanner();
    pannerL.pan.setValueAtTime(-1, audioCtx.currentTime); // hard left
    pannerR = audioCtx.createStereoPanner();
    pannerR.pan.setValueAtTime(1, audioCtx.currentTime); // hard right

    binauralOscL.connect(pannerL);
    pannerL.connect(masterGain);

    binauralOscR.connect(pannerR);
    pannerR.connect(masterGain);
  } else {
    // Fallback simple merge
    binauralOscL.connect(masterGain);
    binauralOscR.connect(masterGain);
  }

  binauralOscL.start();
  binauralOscR.start();
}

// Update Active Frequency in Real-time
function updateFrequency(newFreq) {
  currentFrequency = Math.max(20, Math.min(20000, parseFloat(newFreq) || 440));

  if (audioCtx && isRunning && currentMode === 'single' && singleOsc) {
    singleOsc.frequency.cancelScheduledValues(audioCtx.currentTime);
    singleOsc.frequency.setValueAtTime(singleOsc.frequency.value, audioCtx.currentTime);
    singleOsc.frequency.exponentialRampToValueAtTime(currentFrequency, audioCtx.currentTime + 0.05);
  }

  // Update UI Elements
  hzNumberDisplay.textContent = currentFrequency.toFixed(2);
  freqInput.value = currentFrequency.toFixed(2);
  freqSlider.value = Math.round(freqToSlider(currentFrequency));

  const noteInfo = calculateMusicalNote(currentFrequency);
  musicalNoteLabel.textContent = noteInfo.note;
  wavelengthLabel.textContent = noteInfo.wavelength;
}

// Update Binaural Frequencies
function updateBinauralState() {
  const leftFreq = binauralCarrier;
  const rightFreq = binauralCarrier + binauralBeat;

  leftEarHz.textContent = `${leftFreq.toFixed(2)} Hz`;
  rightEarHz.textContent = `${rightFreq.toFixed(2)} Hz`;
  carrierReadout.textContent = `${binauralCarrier.toFixed(1)} Hz`;
  beatReadout.textContent = `${binauralBeat.toFixed(2)} Hz (${getBrainwaveCategory(binauralBeat)})`;

  if (currentMode === 'binaural') {
    hzNumberDisplay.textContent = `${binauralBeat.toFixed(2)}`;
    musicalNoteLabel.textContent = `Carrier: ${binauralCarrier.toFixed(0)}Hz`;
    wavelengthLabel.textContent = getBrainwaveCategory(binauralBeat);
  }

  if (audioCtx && isRunning && currentMode === 'binaural') {
    if (binauralOscL) {
      binauralOscL.frequency.cancelScheduledValues(audioCtx.currentTime);
      binauralOscL.frequency.setValueAtTime(binauralOscL.frequency.value, audioCtx.currentTime);
      binauralOscL.frequency.exponentialRampToValueAtTime(leftFreq, audioCtx.currentTime + 0.05);
    }
    if (binauralOscR) {
      binauralOscR.frequency.cancelScheduledValues(audioCtx.currentTime);
      binauralOscR.frequency.setValueAtTime(binauralOscR.frequency.value, audioCtx.currentTime);
      binauralOscR.frequency.exponentialRampToValueAtTime(rightFreq, audioCtx.currentTime + 0.05);
    }
  }
}

// Update Play Button Appearance
function updatePlayButtonUI() {
  if (isRunning) {
    btnMasterPlay.classList.remove('btn-primary');
    btnMasterPlay.classList.add('btn-secondary');
    btnMasterPlay.style.borderColor = '#ef4444';
    textPlayState.textContent = 'Stop Tone Generator';
    iconPlayState.innerHTML = '<rect x="6" y="6" width="12" height="12"></rect>';
  } else {
    btnMasterPlay.classList.add('btn-primary');
    btnMasterPlay.classList.remove('btn-secondary');
    btnMasterPlay.style.borderColor = 'transparent';
    textPlayState.textContent = 'Start Tone Generator';
    iconPlayState.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  }
}

// Canvas Sizing
function resizeScopeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = scopeWrapper.getBoundingClientRect();
  const width = Math.max(300, Math.floor(rect.width));
  const height = Math.max(100, Math.floor(rect.height || 160));

  scopeCanvas.width = width * dpr;
  scopeCanvas.height = height * dpr;

  const ctx = scopeCanvas.getContext('2d');
  ctx.resetTransform ? ctx.resetTransform() : ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resizeScopeCanvas);

// Idle Oscilloscope
function renderIdleScope() {
  const width = scopeWrapper.clientWidth || 400;
  const height = scopeWrapper.clientHeight || 160;
  const ctx = scopeCanvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Draw static waveform curve
  ctx.strokeStyle = 'rgba(78, 133, 191, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < width; x++) {
    const angle = (x / width) * Math.PI * 8;
    const y = height / 2 + Math.sin(angle) * (height * 0.3);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// Live Oscilloscope Render Loop
function startScopeAnimation() {
  if (!analyserNode) return;
  const bufferLength = analyserNode.frequencyBinCount;
  const timeData = new Uint8Array(bufferLength);

  function draw() {
    if (!isRunning) return;

    const width = scopeWrapper.clientWidth || 400;
    const height = scopeWrapper.clientHeight || 160;
    const ctx = scopeCanvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    analyserNode.getByteTimeDomainData(timeData);

    // Subtle Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Waveform line
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#89aacc';
    ctx.shadowColor = '#4e85bf';
    ctx.shadowBlur = 10;
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = timeData[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0;

    animFrameId = requestAnimationFrame(draw);
  }

  animFrameId = requestAnimationFrame(draw);
}

// Master Play / Stop Trigger
btnMasterPlay.addEventListener('click', () => {
  if (isRunning) {
    stopTone();
  } else {
    startTone();
  }
});

// Master Mute
btnMuteToggle.addEventListener('click', () => {
  isMuted = !isMuted;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime);
  }
  btnMuteToggle.querySelector('span').textContent = isMuted ? 'Unmute' : 'Mute';
  btnMuteToggle.style.color = isMuted ? '#ef4444' : '';
});

// Mode Switchers
modeSingleBtn.addEventListener('click', () => {
  if (currentMode === 'single') return;
  currentMode = 'single';
  modeSingleBtn.classList.add('active');
  modeBinauralBtn.classList.remove('active');
  panelSingleMode.style.display = 'block';
  panelBinauralMode.style.display = 'none';

  updateFrequency(currentFrequency);
  if (isRunning) {
    stopTone();
    startTone();
  }
});

modeBinauralBtn.addEventListener('click', () => {
  if (currentMode === 'binaural') return;
  currentMode = 'binaural';
  modeBinauralBtn.classList.add('active');
  modeSingleBtn.classList.remove('active');
  panelSingleMode.style.display = 'none';
  panelBinauralMode.style.display = 'block';

  updateBinauralState();
  if (isRunning) {
    stopTone();
    startTone();
  }
});

// Waveform Selector Buttons
waveButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    waveButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentWaveType = btn.dataset.wave;

    if (singleOsc) singleOsc.type = currentWaveType;
    if (binauralOscL) binauralOscL.type = currentWaveType;
    if (binauralOscR) binauralOscR.type = currentWaveType;
  });
});

// Frequency Controls
freqSlider.addEventListener('input', (e) => {
  const f = sliderToFreq(parseFloat(e.target.value));
  updateFrequency(f);
});

freqInput.addEventListener('input', (e) => {
  updateFrequency(e.target.value);
});

// Fine-tuning stepper buttons
document.getElementById('btn-freq-sub-10').addEventListener('click', () => updateFrequency(currentFrequency - 10));
document.getElementById('btn-freq-sub-5').addEventListener('click', () => updateFrequency(currentFrequency - 5));
document.getElementById('btn-freq-sub-1').addEventListener('click', () => updateFrequency(currentFrequency - 1));
document.getElementById('btn-freq-sub-01').addEventListener('click', () => updateFrequency(currentFrequency - 0.1));
document.getElementById('btn-freq-add-01').addEventListener('click', () => updateFrequency(currentFrequency + 0.1));
document.getElementById('btn-freq-add-1').addEventListener('click', () => updateFrequency(currentFrequency + 1));
document.getElementById('btn-freq-add-5').addEventListener('click', () => updateFrequency(currentFrequency + 5));
document.getElementById('btn-freq-add-10').addEventListener('click', () => updateFrequency(currentFrequency + 10));

document.getElementById('btn-octave-down').addEventListener('click', () => updateFrequency(currentFrequency / 2));
document.getElementById('btn-octave-up').addEventListener('click', () => updateFrequency(currentFrequency * 2));

// Volume & Panning Controls
volumeSlider.addEventListener('input', (e) => {
  currentVolume = parseFloat(e.target.value);
  volumeValText.textContent = `${Math.round(currentVolume * 100)}%`;
  if (masterGain && audioCtx && !isMuted) {
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
  }
});

panSlider.addEventListener('input', (e) => {
  currentPan = parseFloat(e.target.value);
  if (currentPan === 0) panValText.textContent = 'Center';
  else if (currentPan < 0) panValText.textContent = `L ${Math.round(Math.abs(currentPan) * 100)}%`;
  else panValText.textContent = `R ${Math.round(currentPan * 100)}%`;

  if (masterPan && audioCtx) {
    masterPan.pan.setValueAtTime(currentPan, audioCtx.currentTime);
  }
});

// Binaural Beat Controls
binauralCarrierSlider.addEventListener('input', (e) => {
  binauralCarrier = parseFloat(e.target.value);
  updateBinauralState();
});

binauralBeatSlider.addEventListener('input', (e) => {
  binauralBeat = parseFloat(e.target.value);
  updateBinauralState();
});

// Brainwave Preset Cards
brainwaveCards.forEach((card) => {
  card.addEventListener('click', () => {
    brainwaveCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    binauralBeat = parseFloat(card.dataset.beat);
    binauralBeatSlider.value = binauralBeat;
    updateBinauralState();
  });
});

// Musical & Acoustic Presets
presetButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetFreq = parseFloat(btn.dataset.freq);
    if (currentMode === 'binaural') {
      binauralCarrier = targetFreq;
      binauralCarrierSlider.value = targetFreq;
      updateBinauralState();
    } else {
      updateFrequency(targetFreq);
    }
  });
});

// Convert AudioBuffer to 16-bit PCM WAV Blob
function audioBufferToWavBlob(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
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

// Export Pure Audio File (WAV)
btnExportWav.addEventListener('click', async () => {
  const exportDuration = parseFloat(exportDurationSelect.value) || 10;
  const sampleRate = 44100;
  const numChannels = 2;

  const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    numChannels,
    sampleRate * exportDuration,
    sampleRate
  );

  const gain = offlineCtx.createGain();
  gain.gain.value = currentVolume;
  gain.connect(offlineCtx.destination);

  if (currentMode === 'single') {
    const osc = offlineCtx.createOscillator();
    osc.type = currentWaveType;
    osc.frequency.setValueAtTime(currentFrequency, 0);

    if (offlineCtx.createStereoPanner) {
      const panner = offlineCtx.createStereoPanner();
      panner.pan.setValueAtTime(currentPan, 0);
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }
    osc.start(0);
    osc.stop(exportDuration);
  } else {
    // Binaural Beats Stereo Offline Rendering
    const leftFreq = binauralCarrier;
    const rightFreq = binauralCarrier + binauralBeat;

    const oscL = offlineCtx.createOscillator();
    oscL.type = currentWaveType;
    oscL.frequency.setValueAtTime(leftFreq, 0);

    const oscR = offlineCtx.createOscillator();
    oscR.type = currentWaveType;
    oscR.frequency.setValueAtTime(rightFreq, 0);

    if (offlineCtx.createStereoPanner) {
      const panL = offlineCtx.createStereoPanner();
      panL.pan.setValueAtTime(-1, 0);
      oscL.connect(panL);
      panL.connect(gain);

      const panR = offlineCtx.createStereoPanner();
      panR.pan.setValueAtTime(1, 0);
      oscR.connect(panR);
      panR.connect(gain);
    } else {
      oscL.connect(gain);
      oscR.connect(gain);
    }

    oscL.start(0);
    oscL.stop(exportDuration);
    oscR.start(0);
    oscR.stop(exportDuration);
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWavBlob(renderedBuffer);

  const filename = currentMode === 'single'
    ? `tone_${currentWaveType}_${currentFrequency.toFixed(1)}Hz_${exportDuration}s.wav`
    : `binaural_${binauralBeat.toFixed(1)}Hz_${binauralCarrier.toFixed(0)}HzCarrier_${exportDuration}s.wav`;

  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(wavBlob);
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  updateFrequency(440.0);
  updateBinauralState();
  resizeScopeCanvas();
  renderIdleScope();
});