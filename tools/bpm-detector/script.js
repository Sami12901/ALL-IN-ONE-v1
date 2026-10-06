// BPM Detector & Tap Tempo - Music Tempo Analyzer
// Dual Mode: Web Audio Peak Detection & Live Interactive Tap Tempo with Synchronized Metronome

let audioCtx = null;
let currentBuffer = null;
let currentBpm = 120;

// Tab navigation
const tabBtnFile = document.getElementById('tab-btn-file');
const tabBtnTap = document.getElementById('tab-btn-tap');
const viewFileAnalyzer = document.getElementById('view-file-analyzer');
const viewTapTempo = document.getElementById('view-tap-tempo');

// File upload & analysis elements
const dropZone = document.getElementById('drop-zone');
const btnBrowseFile = document.getElementById('btn-browse-file');
const fileInput = document.getElementById('audio-file-input');
const btnDemoBeat = document.getElementById('btn-demo-beat');
const fileAnalysisCard = document.getElementById('file-analysis-card');
const btnChangeFile = document.getElementById('btn-change-file');

const trackName = document.getElementById('track-name');
const badgeDuration = document.getElementById('badge-duration');
const badgeSamplerate = document.getElementById('badge-samplerate');
const badgeChannels = document.getElementById('badge-channels');

// Transport
const btnPlayPause = document.getElementById('btn-play-pause');
const playBtnLabel = document.getElementById('play-btn-label');
const btnStop = document.getElementById('btn-stop');
const timelineSlider = document.getElementById('timeline-slider');
const timeDisplay = document.getElementById('time-display');

// Tap elements
const btnTap = document.getElementById('btn-tap');
const btnResetTap = document.getElementById('btn-reset-tap');
const tapStatsLabel = document.getElementById('tap-stats-label');
const tapHistoryList = document.getElementById('tap-history-list');

// BPM results
const bpmDisplayVal = document.getElementById('bpm-display-val');
const tempoClassificationTag = document.getElementById('tempo-classification-tag');
const bpmDetailsNote = document.getElementById('bpm-details-note');
const analysisStatusText = document.getElementById('analysis-status-text');

// BPM Adjustments
const btnHalfBpm = document.getElementById('btn-half-bpm');
const btnDoubleBpm = document.getElementById('btn-double-bpm');
const btnMinusBpm = document.getElementById('btn-minus-bpm');
const btnPlusBpm = document.getElementById('btn-plus-bpm');

// Metronome
const btnToggleMetronome = document.getElementById('btn-toggle-metronome');
const metroBtnLabel = document.getElementById('metro-btn-label');
const checkAudioClick = document.getElementById('check-audio-click');
const beatIntervalVal = document.getElementById('beat-interval-val');
const pulseBeacons = [
  document.getElementById('pulse-beacon-1'),
  document.getElementById('pulse-beacon-2'),
  document.getElementById('pulse-beacon-3'),
  document.getElementById('pulse-beacon-4')
];
const pendulumBob = document.getElementById('pendulum-bob');

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
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Classical Tempo Classification
function getTempoClassification(bpm) {
  if (bpm < 60) return { name: 'Largo', desc: 'Broad, very slow and dignified tempo' };
  if (bpm <= 75) return { name: 'Adagio', desc: 'Slow, leisurely and stately tempo' };
  if (bpm <= 108) return { name: 'Andante', desc: 'Walking pace, flowing and moderate' };
  if (bpm <= 120) return { name: 'Moderato', desc: 'Moderate, medium-paced groove' };
  if (bpm <= 168) return { name: 'Allegro', desc: 'Fast, quickly, lively and bright' };
  return { name: 'Presto', desc: 'Very, very fast and energetic tempo' };
}

// Update Global BPM
function setTempo(bpm, sourceDesc = '') {
  bpm = Math.max(30, Math.min(300, Math.round(bpm)));
  currentBpm = bpm;

  bpmDisplayVal.textContent = bpm;
  const info = getTempoClassification(bpm);
  tempoClassificationTag.textContent = `${info.name} (${bpm} BPM)`;
  bpmDetailsNote.textContent = sourceDesc || info.desc;

  const intervalMs = Math.round(60000 / bpm);
  beatIntervalVal.textContent = `${intervalMs} ms (${(60 / bpm).toFixed(3)}s)`;

  if (isMetronomeRunning) {
    restartMetronome();
  }
}

// Tab Switching
tabBtnFile.addEventListener('click', () => {
  tabBtnFile.classList.add('active');
  tabBtnTap.classList.remove('active');
  viewFileAnalyzer.style.display = 'flex';
  viewTapTempo.style.display = 'none';
});

tabBtnTap.addEventListener('click', () => {
  tabBtnTap.classList.add('active');
  tabBtnFile.classList.remove('active');
  viewTapTempo.style.display = 'flex';
  viewFileAnalyzer.style.display = 'none';
});

// ==========================================
// 1. TAP TEMPO LOGIC
// ==========================================
let tapTimestamps = [];

function registerTap() {
  const now = performance.now();
  getAudioContext();

  // Play short tactile click sound on tap
  if (checkAudioClick.checked) {
    playMetronomeClick(true);
  }

  // Visual tap button active feedback
  btnTap.classList.add('active');
  setTimeout(() => btnTap.classList.remove('active'), 100);

  // If gap > 3 seconds, reset tap sequence
  if (tapTimestamps.length > 0 && (now - tapTimestamps[tapTimestamps.length - 1]) > 3000) {
    tapTimestamps = [];
  }

  tapTimestamps.push(now);

  // Keep last 16 taps
  if (tapTimestamps.length > 16) {
    tapTimestamps.shift();
  }

  if (tapTimestamps.length >= 2) {
    const intervals = [];
    for (let i = 1; i < tapTimestamps.length; i++) {
      intervals.push(tapTimestamps[i] - tapTimestamps[i - 1]);
    }

    // Filter outliers if more than 4 taps
    let filteredIntervals = intervals;
    if (intervals.length >= 4) {
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      filteredIntervals = intervals.filter((d) => Math.abs(d - avg) < avg * 0.4);
      if (filteredIntervals.length === 0) filteredIntervals = intervals;
    }

    const avgInterval = filteredIntervals.reduce((a, b) => a + b, 0) / filteredIntervals.length;
    const computedBpm = Math.round(60000 / avgInterval);

    setTempo(computedBpm, `Tapped Tempo • Average Interval: ${Math.round(avgInterval)} ms`);
    tapStatsLabel.textContent = `Taps: ${tapTimestamps.length} • Average: ${computedBpm} BPM`;

    // Render tap chips
    renderTapHistory(intervals);
  } else {
    tapStatsLabel.textContent = `Taps: 1 • Tap again to calculate tempo...`;
  }
}

function renderTapHistory(intervals) {
  tapHistoryList.innerHTML = '';
  intervals.slice(-8).forEach((interval, idx) => {
    const chip = document.createElement('span');
    chip.className = 'tap-chip';
    const bpm = Math.round(60000 / interval);
    chip.textContent = `#${idx + 1}: ${Math.round(interval)}ms (${bpm} BPM)`;
    tapHistoryList.appendChild(chip);
  });
}

function resetTap() {
  tapTimestamps = [];
  tapStatsLabel.textContent = 'Taps: 0 • Average: -- BPM';
  tapHistoryList.innerHTML = '<span style="color: var(--text-tertiary); font-size: 0.75rem;">Tap history reset. Tap along to restart.</span>';
}

btnTap.addEventListener('click', registerTap);
btnResetTap.addEventListener('click', resetTap);

// Keyboard Spacebar tap
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
    e.preventDefault();
    if (viewTapTempo.style.display !== 'none') {
      registerTap();
    }
  }
});

// ==========================================
// 2. AUDIO FILE BPM ANALYZER LOGIC
// ==========================================

// Web Audio Beat Peak Detection Algorithm
async function analyzeAudioBpm(audioBuffer) {
  analysisStatusText.textContent = 'Filtering rhythmic low-end transients...';

  const sampleRate = audioBuffer.sampleRate;
  const numSamples = audioBuffer.length;
  // Limit analysis window to first 60 seconds for optimal speed
  const maxSec = Math.min(60, audioBuffer.duration);
  const analyzeLength = Math.floor(maxSec * sampleRate);

  // Step 1: Render bass-isolated signal through OfflineAudioContext
  // Lowpass filter at 150Hz captures kick drum & bass rhythms
  const offlineCtx = new OfflineAudioContext(1, analyzeLength, sampleRate);
  const src = offlineCtx.createBufferSource();
  src.buffer = audioBuffer;

  const filter = offlineCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(150, 0);
  filter.Q.setValueAtTime(1.0, 0);

  src.connect(filter);
  filter.connect(offlineCtx.destination);
  src.start(0);

  const filteredBuffer = await offlineCtx.startRendering();
  const channelData = filteredBuffer.getChannelData(0);

  analysisStatusText.textContent = 'Computing rhythmic energy envelope...';
  await new Promise((r) => setTimeout(r, 20));

  // Step 2: Calculate RMS energy envelope over 20ms frames
  const frameDuration = 0.02; // 20ms
  const frameSize = Math.floor(sampleRate * frameDuration);
  const totalFrames = Math.floor(analyzeLength / frameSize);
  const energy = new Float32Array(totalFrames);

  for (let f = 0; f < totalFrames; f++) {
    let sum = 0;
    const start = f * frameSize;
    for (let i = 0; i < frameSize; i++) {
      const val = channelData[start + i];
      sum += val * val;
    }
    energy[f] = Math.sqrt(sum / frameSize);
  }

  // Step 3: Spectral flux / Onset detection (half-wave rectified derivative)
  const flux = new Float32Array(totalFrames);
  for (let f = 1; f < totalFrames; f++) {
    const diff = energy[f] - energy[f - 1];
    flux[f] = diff > 0 ? diff : 0;
  }

  analysisStatusText.textContent = 'Executing autocorrelation tempo scoring...';
  await new Promise((r) => setTimeout(r, 20));

  // Step 4: Autocorrelation over BPM range [60, 200]
  const fps = 1.0 / frameDuration; // 50 fps
  let bestBpm = 120;
  let maxScore = -Infinity;

  const scores = {};

  for (let candidateBpm = 60; candidateBpm <= 200; candidateBpm += 0.5) {
    const lag = Math.round((60 / candidateBpm) * fps);
    if (lag <= 0 || lag >= totalFrames) continue;

    let score = 0;
    let count = 0;
    for (let f = 0; f < totalFrames - lag; f += 2) {
      score += flux[f] * flux[f + lag];
      count++;
    }

    score = count > 0 ? score / count : 0;
    scores[candidateBpm] = score;

    if (score > maxScore) {
      maxScore = score;
      bestBpm = candidateBpm;
    }
  }

  // Harmonic check: if double or half has comparable peak, choose musical sweet spot (85 - 160)
  const halfBpm = Math.round(bestBpm / 2);
  const doubleBpm = Math.round(bestBpm * 2);

  if (bestBpm < 75 && doubleBpm <= 165 && (scores[doubleBpm] || 0) > maxScore * 0.75) {
    bestBpm = doubleBpm;
  } else if (bestBpm > 155 && halfBpm >= 70 && (scores[halfBpm] || 0) > maxScore * 0.8) {
    bestBpm = halfBpm;
  }

  return Math.round(bestBpm);
}

// Load audio file
async function loadAudioFile(arrayBuffer, name, size) {
  try {
    analysisStatusText.textContent = 'Decoding audio file...';
    const ctx = getAudioContext();
    const copy = arrayBuffer.slice(0);
    const decoded = await ctx.decodeAudioData(copy);

    currentBuffer = decoded;
    trackName.textContent = name;
    badgeDuration.textContent = formatTime(decoded.duration);
    badgeSamplerate.textContent = `${(decoded.sampleRate / 1000).toFixed(1)} kHz`;
    badgeChannels.textContent = decoded.numberOfChannels === 1 ? 'Mono' : 'Stereo';

    dropZone.style.display = 'none';
    fileAnalysisCard.style.display = 'flex';

    timeDisplay.textContent = `00:00 / ${formatTime(decoded.duration)}`;
    timelineSlider.value = 0;

    const detectedBpm = await analyzeAudioBpm(decoded);
    setTempo(detectedBpm, `Detected via Web Audio Peak Tracking (${name})`);
    analysisStatusText.textContent = `Analysis complete! Detected tempo: ${detectedBpm} BPM.`;

  } catch (err) {
    console.error('BPM detection error:', err);
    analysisStatusText.textContent = 'Failed to analyze audio: ' + err.message;
  }
}

// Demo Beat Generator: Synthetic 128 BPM 4-on-the-floor dance groove
function generateDemoBeatBuffer() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 8.0; // 8 seconds
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const bpm = 128;
  const beatInterval = 60 / bpm; // ~0.46875s

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const beatPos = t % beatInterval;

    // Heavy Kick Drum
    let kick = 0;
    if (beatPos < 0.22) {
      const kickFreq = 160 * Math.exp(-beatPos * 30) + 50;
      kick = Math.sin(2 * Math.PI * kickFreq * beatPos) * Math.exp(-beatPos * 14) * 1.1;
    }

    // Crisp Offbeat Open Hi-Hat
    let hihat = 0;
    const hatPos = (t + beatInterval / 2) % beatInterval;
    if (hatPos < 0.12) {
      hihat = (Math.random() * 2 - 1) * Math.exp(-hatPos * 25) * 0.35;
    }

    // Sub Bass Pulse
    const bass = Math.sin(2 * Math.PI * 65.4 * t) * 0.3 * (1 - beatPos / beatInterval);

    const val = Math.max(-0.99, Math.min(0.99, kick + hihat + bass));
    left[i] = val;
    right[i] = val;
  }

  return buffer;
}

// Audio Player Transport for loaded audio
let sourceNode = null;
let isAudioPlaying = false;
let audioStartTime = 0;
let audioPauseOffset = 0;
let audioAnimId = null;

function playAudioTrack(offset = 0) {
  if (!currentBuffer) return;
  const ctx = getAudioContext();

  if (isAudioPlaying) {
    stopAudioTrack(false);
  }

  sourceNode = ctx.createBufferSource();
  sourceNode.buffer = currentBuffer;
  sourceNode.connect(ctx.destination);

  sourceNode.onended = () => {
    if (isAudioPlaying) {
      stopAudioTrack(true);
    }
  };

  offset = Math.max(0, Math.min(offset, currentBuffer.duration));
  sourceNode.start(0, offset);

  audioStartTime = ctx.currentTime - offset;
  audioPauseOffset = offset;
  isAudioPlaying = true;
  playBtnLabel.textContent = '❚❚ Pause Audio';

  startAudioTimelineLoop();
}

function pauseAudioTrack() {
  if (!isAudioPlaying) return;
  const ctx = getAudioContext();
  audioPauseOffset = ctx.currentTime - audioStartTime;
  if (sourceNode) {
    try { sourceNode.stop(); } catch (e) {}
    sourceNode.disconnect();
    sourceNode = null;
  }
  isAudioPlaying = false;
  playBtnLabel.textContent = '▶ Play Audio';
}

function stopAudioTrack(resetTimeline = true) {
  if (sourceNode) {
    try { sourceNode.stop(); } catch (e) {}
    sourceNode.disconnect();
    sourceNode = null;
  }
  isAudioPlaying = false;
  playBtnLabel.textContent = '▶ Play Audio';

  if (resetTimeline) {
    audioPauseOffset = 0;
    timelineSlider.value = 0;
    timeDisplay.textContent = `00:00 / ${formatTime(currentBuffer ? currentBuffer.duration : 0)}`;
  }
}

btnPlayPause.addEventListener('click', () => {
  if (!currentBuffer) return;
  if (isAudioPlaying) {
    pauseAudioTrack();
  } else {
    playAudioTrack(audioPauseOffset);
  }
});

btnStop.addEventListener('click', () => stopAudioTrack(true));

timelineSlider.addEventListener('input', () => {
  if (!currentBuffer) return;
  const targetTime = (parseFloat(timelineSlider.value) / 100) * currentBuffer.duration;
  audioPauseOffset = targetTime;
  timeDisplay.textContent = `${formatTime(targetTime)} / ${formatTime(currentBuffer.duration)}`;
  if (isAudioPlaying) {
    playAudioTrack(targetTime);
  }
});

function startAudioTimelineLoop() {
  if (audioAnimId) cancelAnimationFrame(audioAnimId);

  function loop() {
    if (isAudioPlaying && currentBuffer && audioCtx) {
      let currentPos = audioCtx.currentTime - audioStartTime;
      if (currentPos > currentBuffer.duration) currentPos = currentBuffer.duration;
      audioPauseOffset = currentPos;
      timelineSlider.value = (currentPos / currentBuffer.duration) * 100;
      timeDisplay.textContent = `${formatTime(currentPos)} / ${formatTime(currentBuffer.duration)}`;
      audioAnimId = requestAnimationFrame(loop);
    }
  }

  loop();
}

// Upload & Demo Events
dropZone.addEventListener('click', (e) => {
  if (e.target !== btnDemoBeat) {
    fileInput.click();
  }
});
btnBrowseFile.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});
btnChangeFile.addEventListener('click', () => fileInput.click());

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
  reader.onload = (e) => loadAudioFile(e.target.result, file.name, file.size);
  reader.readAsArrayBuffer(file);
}

btnDemoBeat.addEventListener('click', async (e) => {
  e.stopPropagation();
  analysisStatusText.textContent = 'Generating 128 BPM electronic beat...';
  const demoBuf = generateDemoBeatBuffer();
  currentBuffer = demoBuf;
  trackName.textContent = 'Demo_128_BPM_Dance_Groove.wav';
  badgeDuration.textContent = formatTime(demoBuf.duration);
  badgeSamplerate.textContent = `${(demoBuf.sampleRate / 1000).toFixed(1)} kHz`;
  badgeChannels.textContent = 'Stereo';

  dropZone.style.display = 'none';
  fileAnalysisCard.style.display = 'flex';

  timeDisplay.textContent = `00:00 / ${formatTime(demoBuf.duration)}`;
  timelineSlider.value = 0;

  const bpm = await analyzeAudioBpm(demoBuf);
  setTempo(bpm, 'Detected via Web Audio Peak Tracking (Demo Beat)');
  analysisStatusText.textContent = `Analysis complete! Detected tempo: ${bpm} BPM.`;
});

// ==========================================
// 3. SYNCHRONIZED METRONOME LOGIC
// ==========================================
let isMetronomeRunning = false;
let metronomeIntervalId = null;
let currentBeat = 0;

function playMetronomeClick(isDownbeat) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(isDownbeat ? 880 : 440, ctx.currentTime);

  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

function triggerMetronomeBeat() {
  const isDownbeat = (currentBeat === 0);

  // Audio click sound
  if (checkAudioClick.checked) {
    playMetronomeClick(isDownbeat);
  }

  // Visual pulse on beacons
  pulseBeacons.forEach((b, idx) => {
    if (idx === currentBeat) {
      b.classList.add(isDownbeat ? 'downbeat' : 'beat');
    } else {
      b.classList.remove('downbeat', 'beat');
    }
  });

  // Pendulum swing
  if (pendulumBob) {
    pendulumBob.style.left = (currentBeat % 2 === 0) ? '15%' : '85%';
  }

  setTimeout(() => {
    pulseBeacons[currentBeat].classList.remove('downbeat', 'beat');
  }, 100);

  currentBeat = (currentBeat + 1) % 4;
}

function startMetronome() {
  if (isMetronomeRunning) return;
  isMetronomeRunning = true;
  currentBeat = 0;
  metroBtnLabel.textContent = 'Stop Metronome';
  btnToggleMetronome.classList.remove('btn-primary');
  btnToggleMetronome.classList.add('btn-secondary');

  const intervalMs = (60 / currentBpm) * 1000;
  triggerMetronomeBeat();
  metronomeIntervalId = setInterval(triggerMetronomeBeat, intervalMs);
}

function stopMetronome() {
  if (!isMetronomeRunning) return;
  isMetronomeRunning = false;
  if (metronomeIntervalId) clearInterval(metronomeIntervalId);
  metroBtnLabel.textContent = 'Start Metronome';
  btnToggleMetronome.classList.add('btn-primary');
  btnToggleMetronome.classList.remove('btn-secondary');

  pulseBeacons.forEach((b) => b.classList.remove('downbeat', 'beat'));
  if (pendulumBob) pendulumBob.style.left = '50%';
}

function restartMetronome() {
  if (metronomeIntervalId) clearInterval(metronomeIntervalId);
  const intervalMs = (60 / currentBpm) * 1000;
  metronomeIntervalId = setInterval(triggerMetronomeBeat, intervalMs);
}

btnToggleMetronome.addEventListener('click', () => {
  if (isMetronomeRunning) {
    stopMetronome();
  } else {
    startMetronome();
  }
});

// BPM Adjustment buttons
btnHalfBpm.addEventListener('click', () => setTempo(Math.round(currentBpm / 2), 'Halved Tempo'));
btnDoubleBpm.addEventListener('click', () => setTempo(Math.round(currentBpm * 2), 'Doubled Tempo'));
btnMinusBpm.addEventListener('click', () => setTempo(currentBpm - 1, 'Manual Adjustment'));
btnPlusBpm.addEventListener('click', () => setTempo(currentBpm + 1, 'Manual Adjustment'));

// Initialize with default 120 BPM
setTempo(120, 'Default tempo (Upload audio or tap to detect)');