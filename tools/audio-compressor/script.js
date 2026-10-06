// Audio Compressor Studio - Web Audio Dynamic Range Compressor
// Client-side real-time processing and WAV export

let audioCtx = null;
let currentBuffer = null;
let currentFileName = 'audio_track';
let currentFileSize = 0;

// Web Audio Graph nodes for real-time playback
let sourceNode = null;
let compressorNode = null;
let makeupGainNode = null;
let wetGainNode = null;
let dryGainNode = null;
let masterGainNode = null;
let analyserNode = null;

// Playback state
let isPlaying = false;
let startTime = 0;
let pauseOffset = 0;
let isAuditionCompressed = true;
let animFrameId = null;

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

// Sliders and values
const thresholdSlider = document.getElementById('threshold-slider');
const thresholdVal = document.getElementById('threshold-val');
const kneeSlider = document.getElementById('knee-slider');
const kneeVal = document.getElementById('knee-val');
const ratioSlider = document.getElementById('ratio-slider');
const ratioVal = document.getElementById('ratio-val');
const attackSlider = document.getElementById('attack-slider');
const attackVal = document.getElementById('attack-val');
const releaseSlider = document.getElementById('release-slider');
const releaseVal = document.getElementById('release-val');
const makeupSlider = document.getElementById('makeup-slider');
const makeupVal = document.getElementById('makeup-val');

// Meter & Audition
const abBtnCompressed = document.getElementById('ab-btn-compressed');
const abBtnOriginal = document.getElementById('ab-btn-original');
const auditionModeDesc = document.getElementById('audition-mode-desc');
const grMeterReadout = document.getElementById('gr-meter-readout');
const grMeterFill = document.getElementById('gr-meter-fill');
const visualizerCanvas = document.getElementById('visualizer-canvas');
const visualizerCtx = visualizerCanvas ? visualizerCanvas.getContext('2d') : null;

// Transport
const btnPlayPause = document.getElementById('btn-play-pause');
const playBtnLabel = document.getElementById('play-btn-label');
const btnStop = document.getElementById('btn-stop');
const timelineSlider = document.getElementById('timeline-slider');
const timeDisplay = document.getElementById('time-display');
const checkLoop = document.getElementById('check-loop');
const volumeSlider = document.getElementById('volume-slider');

// Export
const btnDownloadWav = document.getElementById('btn-download-wav');
const exportStatus = document.getElementById('export-status');
const exportResult = document.getElementById('export-result');
const exportFileMeta = document.getElementById('export-file-meta');
const exportAudioPlayer = document.getElementById('export-audio-player');
const btnDirectDownload = document.getElementById('btn-direct-download');

// Presets
const presetPills = document.querySelectorAll('.preset-pill');

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

// Helpers
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function dbToGain(db) {
  return Math.pow(10, db / 20);
}

// Update UI Readouts
function updateReadouts() {
  const t = parseFloat(thresholdSlider.value);
  const k = parseFloat(kneeSlider.value);
  const r = parseFloat(ratioSlider.value);
  const a = parseFloat(attackSlider.value);
  const rel = parseFloat(releaseSlider.value);
  const m = parseFloat(makeupSlider.value);

  thresholdVal.textContent = `${t.toFixed(0)} dB`;
  kneeVal.textContent = `${k.toFixed(0)} dB`;
  ratioVal.textContent = `${r.toFixed(1)}:1`;
  attackVal.textContent = a < 0.01 ? `${(a * 1000).toFixed(1)} ms` : `${a.toFixed(3)} s`;
  releaseVal.textContent = rel < 0.1 ? `${(rel * 1000).toFixed(0)} ms` : `${rel.toFixed(2)} s`;
  makeupVal.textContent = `+${m.toFixed(1)} dB`;

  if (compressorNode && audioCtx) {
    const now = audioCtx.currentTime;
    compressorNode.threshold.setTargetAtTime(t, now, 0.01);
    compressorNode.knee.setTargetAtTime(k, now, 0.01);
    compressorNode.ratio.setTargetAtTime(r, now, 0.01);
    compressorNode.attack.setTargetAtTime(a, now, 0.01);
    compressorNode.release.setTargetAtTime(rel, now, 0.01);
  }
  if (makeupGainNode && audioCtx) {
    const now = audioCtx.currentTime;
    makeupGainNode.gain.setTargetAtTime(dbToGain(m), now, 0.01);
  }
}

// Preset configurations
const presets = {
  vocal: { threshold: -20, knee: 20, ratio: 4, attack: 0.005, release: 0.15, makeup: 3 },
  drums: { threshold: -18, knee: 10, ratio: 6, attack: 0.020, release: 0.10, makeup: 4 },
  master: { threshold: -12, knee: 25, ratio: 2, attack: 0.030, release: 0.30, makeup: 1.5 },
  heavy: { threshold: -32, knee: 40, ratio: 16, attack: 0.002, release: 0.15, makeup: 8 },
  broadcast: { threshold: -24, knee: 30, ratio: 8, attack: 0.003, release: 0.25, makeup: 5 },
  reset: { threshold: -24, knee: 30, ratio: 12, attack: 0.003, release: 0.25, makeup: 3 }
};

presetPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    presetPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    const key = pill.dataset.preset;
    const config = presets[key];
    if (config) {
      thresholdSlider.value = config.threshold;
      kneeSlider.value = config.knee;
      ratioSlider.value = config.ratio;
      attackSlider.value = config.attack;
      releaseSlider.value = config.release;
      makeupSlider.value = config.makeup;
      updateReadouts();
    }
  });
});

[thresholdSlider, kneeSlider, ratioSlider, attackSlider, releaseSlider, makeupSlider].forEach((slider) => {
  slider.addEventListener('input', () => {
    presetPills.forEach((p) => p.classList.remove('active'));
    updateReadouts();
  });
});

// A/B Audition Toggle
function setAuditionMode(compressed) {
  isAuditionCompressed = compressed;
  if (compressed) {
    abBtnCompressed.classList.add('active');
    abBtnOriginal.classList.remove('active');
    auditionModeDesc.textContent = 'Currently listening to Compressed Audio';
  } else {
    abBtnCompressed.classList.remove('active');
    abBtnOriginal.classList.add('active');
    auditionModeDesc.textContent = 'Currently listening to Original Audio (Bypass)';
  }

  if (audioCtx && wetGainNode && dryGainNode) {
    const now = audioCtx.currentTime;
    if (compressed) {
      wetGainNode.gain.setTargetAtTime(1.0, now, 0.02);
      dryGainNode.gain.setTargetAtTime(0.0, now, 0.02);
    } else {
      wetGainNode.gain.setTargetAtTime(0.0, now, 0.02);
      dryGainNode.gain.setTargetAtTime(1.0, now, 0.02);
    }
  }
}

abBtnCompressed.addEventListener('click', () => setAuditionMode(true));
abBtnOriginal.addEventListener('click', () => setAuditionMode(false));

// Volume Slider
volumeSlider.addEventListener('input', () => {
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setTargetAtTime(parseFloat(volumeSlider.value), audioCtx.currentTime, 0.02);
  }
});

// Setup audio nodes graph
function initAudioGraph() {
  const ctx = getAudioContext();

  compressorNode = ctx.createDynamicsCompressor();
  makeupGainNode = ctx.createGain();
  wetGainNode = ctx.createGain();
  dryGainNode = ctx.createGain();
  masterGainNode = ctx.createGain();
  analyserNode = ctx.createAnalyser();
  analyserNode.fftSize = 256;

  // Apply slider settings
  updateReadouts();
  masterGainNode.gain.value = parseFloat(volumeSlider.value);

  // Set initial wet/dry gains
  wetGainNode.gain.value = isAuditionCompressed ? 1.0 : 0.0;
  dryGainNode.gain.value = isAuditionCompressed ? 0.0 : 1.0;

  // Graph wiring:
  // compressorNode -> makeupGainNode -> wetGainNode -> masterGainNode
  // dryGainNode -> masterGainNode
  // masterGainNode -> analyserNode -> destination
  compressorNode.connect(makeupGainNode);
  makeupGainNode.connect(wetGainNode);
  wetGainNode.connect(masterGainNode);

  dryGainNode.connect(masterGainNode);

  masterGainNode.connect(analyserNode);
  analyserNode.connect(ctx.destination);
}

// Start Playback from offset
function playAudio(offset = 0) {
  if (!currentBuffer) return;
  const ctx = getAudioContext();

  if (isPlaying) {
    stopAudio(false);
  }

  if (!compressorNode) {
    initAudioGraph();
  }

  sourceNode = ctx.createBufferSource();
  sourceNode.buffer = currentBuffer;
  sourceNode.loop = checkLoop.checked;

  // Connect source to both paths
  sourceNode.connect(compressorNode);
  sourceNode.connect(dryGainNode);

  sourceNode.onended = () => {
    if (isPlaying && !checkLoop.checked) {
      stopAudio(true);
    }
  };

  offset = Math.max(0, Math.min(offset, currentBuffer.duration));
  sourceNode.start(0, offset);

  startTime = ctx.currentTime - offset;
  pauseOffset = offset;
  isPlaying = true;

  playBtnLabel.textContent = '❚❚ Pause';
  startVisualizerLoop();
}

function pauseAudio() {
  if (!isPlaying) return;
  const ctx = getAudioContext();
  pauseOffset = (ctx.currentTime - startTime) % currentBuffer.duration;
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
    timeDisplay.textContent = `00:00 / ${formatTime(currentBuffer ? currentBuffer.duration : 0)}`;
  }

  // Reset Gain Reduction meter
  grMeterFill.style.width = '0%';
  grMeterReadout.textContent = '0.0 dB';
}

btnPlayPause.addEventListener('click', () => {
  if (!currentBuffer) return;
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

// Timeline Scrubbing
timelineSlider.addEventListener('input', () => {
  if (!currentBuffer) return;
  const targetTime = (parseFloat(timelineSlider.value) / 100) * currentBuffer.duration;
  pauseOffset = targetTime;
  timeDisplay.textContent = `${formatTime(targetTime)} / ${formatTime(currentBuffer.duration)}`;
  if (isPlaying) {
    playAudio(targetTime);
  }
});

// Visualizer and Meter Animation Loop
function startVisualizerLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 128;
  const dataArray = new Uint8Array(bufferLength);

  function renderFrame() {
    if (!visualizerCanvas || !visualizerCtx) return;

    // 1. Meter update
    if (isPlaying && compressorNode && isAuditionCompressed) {
      // DynamicsCompressorNode.reduction returns negative dB or 0
      const redDb = compressorNode.reduction || 0;
      const absDb = Math.abs(redDb);
      // Meter scale 0 to 30 dB
      const pct = Math.min(100, (absDb / 30) * 100);
      grMeterFill.style.width = `${pct}%`;
      grMeterReadout.textContent = absDb > 0.05 ? `-${absDb.toFixed(1)} dB` : '0.0 dB';
    } else {
      grMeterFill.style.width = '0%';
      grMeterReadout.textContent = '0.0 dB (Bypass)';
    }

    // 2. Timeline update
    if (isPlaying && currentBuffer && audioCtx) {
      let currentPos = (audioCtx.currentTime - startTime);
      if (checkLoop.checked) {
        currentPos = currentPos % currentBuffer.duration;
      } else if (currentPos > currentBuffer.duration) {
        currentPos = currentBuffer.duration;
      }
      pauseOffset = currentPos;
      const pct = (currentPos / currentBuffer.duration) * 100;
      timelineSlider.value = pct;
      timeDisplay.textContent = `${formatTime(currentPos)} / ${formatTime(currentBuffer.duration)}`;
    }

    // 3. Canvas Visualizer
    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;

    visualizerCtx.clearRect(0, 0, width, height);
    visualizerCtx.fillStyle = 'rgba(10, 14, 20, 0.95)';
    visualizerCtx.fillRect(0, 0, width, height);

    if (analyserNode && isPlaying) {
      analyserNode.getByteTimeDomainData(dataArray);

      visualizerCtx.lineWidth = 2;
      visualizerCtx.strokeStyle = isAuditionCompressed ? '#4e85bf' : '#10b981';
      visualizerCtx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          visualizerCtx.moveTo(x, y);
        } else {
          visualizerCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      visualizerCtx.lineTo(width, height / 2);
      visualizerCtx.stroke();
    } else {
      // Idle line
      visualizerCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      visualizerCtx.lineWidth = 1;
      visualizerCtx.beginPath();
      visualizerCtx.moveTo(0, height / 2);
      visualizerCtx.lineTo(width, height / 2);
      visualizerCtx.stroke();
    }

    if (isPlaying) {
      animFrameId = requestAnimationFrame(renderFrame);
    }
  }

  renderFrame();
}

// Resize canvas to match display pixel size
function resizeCanvas() {
  if (!visualizerCanvas) return;
  const rect = visualizerCanvas.getBoundingClientRect();
  visualizerCanvas.width = rect.width * (window.devicePixelRatio || 1);
  visualizerCanvas.height = rect.height * (window.devicePixelRatio || 1);
}
window.addEventListener('resize', resizeCanvas);

// File loading
async function loadAudioBuffer(arrayBuffer, name, size) {
  try {
    exportStatus.textContent = 'Decoding audio...';
    const ctx = getAudioContext();
    const copyBuffer = arrayBuffer.slice(0);
    const decodedBuffer = await ctx.decodeAudioData(copyBuffer);
    setAudioData(decodedBuffer, name, size);
  } catch (err) {
    console.error('Audio decoding failed:', err);
    alert('Unable to decode audio. Please ensure the file is a valid audio format.');
    exportStatus.textContent = 'Decode error.';
  }
}

function setAudioData(buffer, name, size) {
  stopAudio(true);
  currentBuffer = buffer;
  currentFileName = name.replace(/\.[^/.]+$/, '');
  currentFileSize = size;

  trackName.textContent = name;
  badgeDuration.textContent = formatTime(buffer.duration);
  badgeSamplerate.textContent = `${(buffer.sampleRate / 1000).toFixed(1)} kHz`;
  badgeChannels.textContent = buffer.numberOfChannels === 1 ? 'Mono' : 'Stereo';
  badgeSize.textContent = formatBytes(size);

  timelineSlider.value = 0;
  timeDisplay.textContent = `00:00 / ${formatTime(buffer.duration)}`;

  dropZone.style.display = 'none';
  studioWorkspace.style.display = 'flex';
  exportResult.style.display = 'none';
  exportStatus.textContent = '';

  resizeCanvas();
  initAudioGraph();
  startVisualizerLoop();
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

// Export Compressed Audio via OfflineAudioContext
let activeExportUrl = null;

btnDownloadWav.addEventListener('click', async () => {
  if (!currentBuffer) return;

  try {
    btnDownloadWav.disabled = true;
    exportStatus.textContent = 'Rendering compressed audio with OfflineAudioContext...';

    const numChannels = currentBuffer.numberOfChannels;
    const sampleRate = currentBuffer.sampleRate;
    const length = currentBuffer.length;

    const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);

    const offlineSource = offlineCtx.createBufferSource();
    offlineSource.buffer = currentBuffer;

    const offlineCompressor = offlineCtx.createDynamicsCompressor();
    offlineCompressor.threshold.setValueAtTime(parseFloat(thresholdSlider.value), 0);
    offlineCompressor.knee.setValueAtTime(parseFloat(kneeSlider.value), 0);
    offlineCompressor.ratio.setValueAtTime(parseFloat(ratioSlider.value), 0);
    offlineCompressor.attack.setValueAtTime(parseFloat(attackSlider.value), 0);
    offlineCompressor.release.setValueAtTime(parseFloat(releaseSlider.value), 0);

    const offlineMakeup = offlineCtx.createGain();
    offlineMakeup.gain.setValueAtTime(dbToGain(parseFloat(makeupSlider.value)), 0);

    offlineSource.connect(offlineCompressor);
    offlineCompressor.connect(offlineMakeup);
    offlineMakeup.connect(offlineCtx.destination);

    offlineSource.start(0);

    const renderedBuffer = await offlineCtx.startRendering();

    exportStatus.textContent = 'Encoding 16-bit WAV PCM...';
    await new Promise((r) => setTimeout(r, 20));

    const wavBlob = bufferToWavBlob(renderedBuffer);

    if (activeExportUrl) {
      URL.revokeObjectURL(activeExportUrl);
    }
    activeExportUrl = URL.createObjectURL(wavBlob);

    const downloadName = `${currentFileName}_compressed.wav`;

    exportFileMeta.textContent = `WAV 16-bit • ${(renderedBuffer.sampleRate / 1000).toFixed(1)} kHz • ${formatBytes(wavBlob.size)}`;
    exportAudioPlayer.src = activeExportUrl;
    btnDirectDownload.href = activeExportUrl;
    btnDirectDownload.download = downloadName;

    exportResult.style.display = 'flex';
    exportStatus.textContent = 'Export completed successfully!';

    // Automatic download trigger
    const link = document.createElement('a');
    link.href = activeExportUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error('Compressed audio export failed:', err);
    exportStatus.textContent = 'Export failed: ' + err.message;
  } finally {
    btnDownloadWav.disabled = false;
  }
});

// Demo Audio Generator (Dynamic beats with loud kick & quiet synth to showcase compression)
function generateDemoAudioBuffer() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 5.0; // 5 seconds
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const bpm = 120;
  const beatInterval = 60 / bpm; // 0.5s

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const beatPos = t % beatInterval;

    // Kick drum peak (loud punch at each beat onset)
    let kick = 0;
    if (beatPos < 0.25) {
      const kickFreq = 140 * Math.exp(-beatPos * 25) + 45;
      const kickEnv = Math.exp(-beatPos * 12);
      kick = Math.sin(2 * Math.PI * kickFreq * beatPos) * kickEnv * 1.2;
    }

    // Hi-hat noise on off-beats
    let hihat = 0;
    const hatPos = (t + beatInterval / 2) % beatInterval;
    if (hatPos < 0.08) {
      const hatEnv = Math.exp(-hatPos * 40);
      hihat = (Math.random() * 2 - 1) * hatEnv * 0.35;
    }

    // Warm synthesizer pad (sustained chords with dynamics)
    const chordFrequencies = [220, 277.18, 329.63, 440]; // A major
    let pad = 0;
    for (let c = 0; c < chordFrequencies.length; c++) {
      const f = chordFrequencies[c];
      pad += Math.sin(2 * Math.PI * f * t) * 0.12;
    }

    // Dynamic swell
    const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.2 * t);
    const combined = kick + hihat + (pad * swell);

    left[i] = Math.max(-0.99, Math.min(0.99, combined));
    right[i] = Math.max(-0.99, Math.min(0.99, combined * 0.95 + hihat * 0.1));
  }

  return buffer;
}

// Drag & Drop & File Input Events
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
  exportStatus.textContent = 'Generating dynamic drum & synth demo...';
  const demoBuf = generateDemoAudioBuffer();
  setAudioData(demoBuf, 'Studio_Drums_and_Synth_Demo.wav', demoBuf.length * 4);
});