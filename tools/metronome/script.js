// Metronome Beat Guide - Precision Web Audio API & Interactive Canvas Engine
// Architecture: Lookahead Audio Scheduler (drift-free) + RAF Canvas & LED Visualizer

// Accent Level Constants
const ACCENT_DOWNBEAT = 0; // Primary accented chime on downbeat
const ACCENT_REGULAR = 1;  // Normal standard click
const ACCENT_SOFT = 2;     // Soft / secondary beat
const ACCENT_MUTE = 3;     // Muted / silent beat (for internal rhythm training)

// Italian Tempo Markings Database
const TEMPO_MARKINGS = [
  { name: 'Larghissimo / Grave', min: 30, max: 39, desc: 'Very slow, solemn, and serious' },
  { name: 'Largo', min: 40, max: 60, desc: 'Broadly, slow and dignified' },
  { name: 'Larghetto', min: 61, max: 65, desc: 'Rather broadly, slightly faster than Largo' },
  { name: 'Adagio', min: 66, max: 76, desc: 'Slow, stately, with great expression' },
  { name: 'Andante', min: 77, max: 108, desc: 'At a walking pace, flowing and gentle' },
  { name: 'Moderato', min: 109, max: 120, desc: 'Moderately, reasonable tempo' },
  { name: 'Allegro', min: 121, max: 168, desc: 'Fast, quickly, bright, and lively' },
  { name: 'Presto', min: 169, max: 200, desc: 'Very, very fast, agile and virtuosic' },
  { name: 'Prestissimo', min: 201, max: 300, desc: 'Extremely fast, as fast as possible' }
];

// Metronome Application State
const state = {
  isPlaying: false,
  bpm: 120,
  beatsPerBar: 4,
  noteUnit: 4,
  subdivision: 1, // 1: quarter, 2: eighths, 3: triplets, 4: 16ths
  soundPreset: 'woodblock', // 'woodblock', 'beep', 'rimshot'
  pitchSetting: 'medium',   // 'high', 'medium', 'low'
  volume: 0.8,
  isMuted: false,
  downbeatAccent: true,
  visualFlash: true,
  
  // Custom beat accents for each beat in the measure
  beatAccents: [ACCENT_DOWNBEAT, ACCENT_REGULAR, ACCENT_SOFT, ACCENT_REGULAR],
  
  // Timing & Position
  currentBeat: 0,
  currentSubBeat: 0,
  currentBar: 1,
  nextNoteTime: 0.0,
  
  // Speed Trainer
  speedTrainerEnabled: false,
  trainerStep: 2,
  trainerBars: 4,
  trainerTargetBpm: 160,
  barsAtCurrentSpeed: 0,

  // Practice Timer
  timerModeMinutes: 0, // 0 = count up stopwatch, >0 = countdown
  timerElapsedSeconds: 0,
  timerIntervalId: null,
  timerCompleted: false
};

// Tap Tempo State
const tapTempoState = {
  tapTimes: [],
  resetTimeout: null
};

// Web Audio Scheduling Parameters
const lookahead = 25.0; // Interval in milliseconds
const scheduleAheadTime = 0.1; // Schedule audio 100ms in advance
let audioCtx = null;
let schedulerTimerId = null;
let visualQueue = [];

// Pendulum Animation State
let pendulumCanvas = null;
let pendulumCtx = null;
let pendulumAngle = 0.0;
let pendulumTargetAngle = 0.0;
let pendulumStartTime = 0;

/**
 * Initialize AudioContext on first user gesture
 */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Get pitch frequency multiplier
 */
function getPitchMultiplier() {
  switch (state.pitchSetting) {
    case 'high': return 1.25;
    case 'low': return 0.80;
    case 'medium':
    default: return 1.0;
  }
}

/**
 * Audio Synthesizer: Synthesizes rich acoustic woodblock, clean electronic beep, or drum rimshot
 */
function playSynthesizedSound(time, accentType, isSubdivision) {
  if (state.isMuted || state.volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const pitchMult = getPitchMultiplier();
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  // Effective volume calculation based on accent level
  let baseGain = state.volume;
  if (isSubdivision) {
    baseGain *= 0.32;
  } else {
    switch (accentType) {
      case ACCENT_DOWNBEAT:
        baseGain *= state.downbeatAccent ? 1.0 : 0.75;
        break;
      case ACCENT_REGULAR:
        baseGain *= 0.72;
        break;
      case ACCENT_SOFT:
        baseGain *= 0.45;
        break;
      case ACCENT_MUTE:
        return; // Silent beat
    }
  }

  const preset = state.soundPreset;

  if (preset === 'beep') {
    // ------------------------------------------------------------------
    // DIGITAL BEEP: Pure crystal-clear sine wave chime
    // ------------------------------------------------------------------
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    let freq = 880 * pitchMult;
    let duration = 0.06;

    if (!isSubdivision && accentType === ACCENT_DOWNBEAT && state.downbeatAccent) {
      freq = 1760 * pitchMult; // A6 chime
      duration = 0.085;
    } else if (isSubdivision) {
      freq = 587.33 * pitchMult; // D5
      duration = 0.035;
    } else if (accentType === ACCENT_SOFT) {
      freq = 660 * pitchMult;
      duration = 0.045;
    }

    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(baseGain * 0.85, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.01);

  } else if (preset === 'rimshot') {
    // ------------------------------------------------------------------
    // DRUM RIMSHOT: Snappy acoustic drumstick click + filtered noise burst
    // ------------------------------------------------------------------
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    let startFreq = 1600 * pitchMult;
    let endFreq = 220 * pitchMult;
    let noiseFilterFreq = 3400 * pitchMult;
    let duration = 0.04;

    if (!isSubdivision && accentType === ACCENT_DOWNBEAT && state.downbeatAccent) {
      startFreq = 2400 * pitchMult;
      endFreq = 350 * pitchMult;
      noiseFilterFreq = 4200 * pitchMult;
      duration = 0.055;
    } else if (isSubdivision) {
      startFreq = 1200 * pitchMult;
      endFreq = 200 * pitchMult;
      noiseFilterFreq = 2800 * pitchMult;
      duration = 0.025;
    }

    // Pitch plunge oscillator
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration * 0.6);

    oscGain.gain.setValueAtTime(0.0001, time);
    oscGain.gain.linearRampToValueAtTime(baseGain * 0.9, time + 0.001);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(time);
    osc.stop(time + duration + 0.01);

    // Filtered white noise burst for crisp stick impact
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    if (bufferSize > 0) {
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(noiseFilterFreq, time);
      filter.Q.setValueAtTime(3.5, time);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(baseGain * 0.7, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);

      whiteNoise.start(time);
      whiteNoise.stop(time + duration + 0.005);
    }

  } else {
    // ------------------------------------------------------------------
    // CLASSIC WOODBLOCK: Dual harmonic resonant acoustic wooden knock
    // ------------------------------------------------------------------
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    let fundamental = 820 * pitchMult;
    let overtone = fundamental * 1.85;
    let duration = 0.045;

    if (!isSubdivision && accentType === ACCENT_DOWNBEAT && state.downbeatAccent) {
      fundamental = 1280 * pitchMult;
      overtone = fundamental * 1.82;
      duration = 0.055;
    } else if (isSubdivision) {
      fundamental = 960 * pitchMult;
      overtone = fundamental * 1.80;
      duration = 0.028;
    } else if (accentType === ACCENT_SOFT) {
      fundamental = 680 * pitchMult;
      overtone = fundamental * 1.80;
      duration = 0.038;
    }

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(fundamental * 1.25, time);
    osc1.frequency.exponentialRampToValueAtTime(fundamental, time + 0.006);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(overtone * 1.2, time);
    osc2.frequency.exponentialRampToValueAtTime(overtone, time + 0.006);

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(baseGain, time + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.01);
    osc2.stop(time + duration + 0.01);
  }
}

/**
 * Schedule next metronome note in the Web Audio lookahead queue
 */
function scheduleNote(beatNumber, subBeatNumber, time, barNumber) {
  const isSub = subBeatNumber > 0;
  const accent = state.beatAccents[beatNumber] !== undefined ? state.beatAccents[beatNumber] : ACCENT_REGULAR;

  // Play audio
  playSynthesizedSound(time, accent, isSub);

  // Enqueue for synchronized visual rendering
  visualQueue.push({
    beat: beatNumber,
    subBeat: subBeatNumber,
    accent: accent,
    time: time,
    bar: barNumber
  });
}

/**
 * Advance beat counters and calculate exact next note time
 */
function nextNote() {
  const secondsPerSubdivision = (60.0 / state.bpm) / state.subdivision;
  state.nextNoteTime += secondsPerSubdivision;

  state.currentSubBeat++;
  if (state.currentSubBeat >= state.subdivision) {
    state.currentSubBeat = 0;
    state.currentBeat++;
    if (state.currentBeat >= state.beatsPerBar) {
      state.currentBeat = 0;
      state.currentBar++;
      handleBarCompleted();
    }
  }
}

/**
 * Chris Wilson's Web Audio lookahead scheduler
 */
function scheduler() {
  const ctx = getAudioContext();
  if (!ctx) return;

  while (state.nextNoteTime < ctx.currentTime + scheduleAheadTime) {
    scheduleNote(state.currentBeat, state.currentSubBeat, state.nextNoteTime, state.currentBar);
    nextNote();
  }
}

/**
 * Speed Trainer Bar Progression Handler
 */
function handleBarCompleted() {
  if (!state.speedTrainerEnabled) return;

  state.barsAtCurrentSpeed++;
  if (state.barsAtCurrentSpeed >= state.trainerBars) {
    state.barsAtCurrentSpeed = 0;
    if (state.bpm < state.trainerTargetBpm) {
      const nextBpm = Math.min(state.trainerTargetBpm, state.bpm + state.trainerStep);
      setBpm(nextBpm);
      showToast(`Speed Trainer: Accelerated to ${nextBpm} BPM!`);
    }
  }
}

/**
 * Start the Metronome Engine
 */
function startMetronome() {
  const ctx = getAudioContext();
  if (!ctx) return;

  state.isPlaying = true;
  state.currentBeat = 0;
  state.currentSubBeat = 0;
  state.currentBar = 1;
  state.barsAtCurrentSpeed = 0;
  state.nextNoteTime = ctx.currentTime + 0.05;
  pendulumStartTime = ctx.currentTime + 0.05;

  visualQueue = [];

  if (schedulerTimerId) clearInterval(schedulerTimerId);
  schedulerTimerId = setInterval(scheduler, lookahead);

  startPracticeTimer();
  updatePlayButtonUI();
}

/**
 * Stop the Metronome Engine
 */
function stopMetronome() {
  state.isPlaying = false;
  if (schedulerTimerId) {
    clearInterval(schedulerTimerId);
    schedulerTimerId = null;
  }
  visualQueue = [];

  // Reset visual beat highlight
  clearBeatHighlights();
  stopPracticeTimer();
  updatePlayButtonUI();
}

/**
 * Toggle Start/Stop
 */
function togglePlay() {
  if (state.isPlaying) {
    stopMetronome();
  } else {
    startMetronome();
  }
}

/**
 * Set Tempo (BPM) with validation, UI sync & lookahead alignment
 */
function setBpm(newBpm) {
  const clamped = Math.max(30, Math.min(300, Math.round(newBpm)));
  state.bpm = clamped;

  // If playing, prevent long pauses when switching from slow to fast tempo
  if (state.isPlaying && audioCtx) {
    const maxSubInterval = (60.0 / state.bpm) / state.subdivision;
    if (state.nextNoteTime - audioCtx.currentTime > maxSubInterval * 1.5) {
      state.nextNoteTime = audioCtx.currentTime + 0.02;
    }
  }

  const bpmInput = document.getElementById('bpm-input');
  const bpmSlider = document.getElementById('bpm-slider');
  if (bpmInput && parseInt(bpmInput.value, 10) !== clamped) bpmInput.value = clamped;
  if (bpmSlider && parseInt(bpmSlider.value, 10) !== clamped) bpmSlider.value = clamped;

  updateItalianTempoMarking();
  highlightActiveTablePreset();
}

/**
 * Step BPM by offset
 */
function stepBpm(delta) {
  setBpm(state.bpm + delta);
}

/**
 * Update Italian Tempo Display Badge & Subtitle
 */
function updateItalianTempoMarking() {
  const marking = TEMPO_MARKINGS.find(m => state.bpm >= m.min && state.bpm <= m.max) || TEMPO_MARKINGS[TEMPO_MARKINGS.length - 1];
  
  const badge = document.getElementById('tempo-marking-badge');
  const desc = document.getElementById('tempo-marking-desc');

  if (badge) {
    badge.textContent = `${marking.name} (${marking.min}–${marking.max})`;
  }
  if (desc) {
    desc.textContent = marking.desc;
  }

  // Update preset pills active state
  document.querySelectorAll('.preset-pill').forEach(pill => {
    const pillBpm = parseInt(pill.dataset.bpm, 10);
    if (pillBpm === state.bpm) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
}

/**
 * Highlight active row in the Italian Reference Table
 */
function highlightActiveTablePreset() {
  document.querySelectorAll('#tempo-reference-table tbody tr').forEach(row => {
    const marking = TEMPO_MARKINGS.find(m => state.bpm >= m.min && state.bpm <= m.max);
    if (marking && row.querySelector('strong')?.textContent.includes(marking.name.split('/')[0].trim())) {
      row.classList.add('active-tempo-row');
    } else {
      row.classList.remove('active-tempo-row');
    }
  });
}

/**
 * Set Time Signature (e.g. 2/4, 3/4, 4/4, 5/4, 6/8, 7/8)
 */
function setTimeSignature(beats, unit) {
  state.beatsPerBar = parseInt(beats, 10) || 4;
  state.noteUnit = parseInt(unit, 10) || 4;

  // Initialize standard accent patterns
  state.beatAccents = [];
  for (let i = 0; i < state.beatsPerBar; i++) {
    if (i === 0) {
      state.beatAccents.push(ACCENT_DOWNBEAT);
    } else if (state.beatsPerBar === 4 && i === 2) {
      state.beatAccents.push(ACCENT_SOFT); // Secondary accent on Beat 3 in 4/4
    } else if (state.beatsPerBar === 6 && i === 3) {
      state.beatAccents.push(ACCENT_SOFT); // Secondary accent on Beat 4 in 6/8
    } else {
      state.beatAccents.push(ACCENT_REGULAR);
    }
  }

  // Reset current beat if playing
  state.currentBeat = 0;
  state.currentSubBeat = 0;

  renderBeatLedStrip();
  updateMeterDisplay();

  // Update button active state
  document.querySelectorAll('#time-signature-selector .select-toggle-btn').forEach(btn => {
    const b = parseInt(btn.dataset.beats, 10);
    const u = parseInt(btn.dataset.unit, 10);
    if (b === state.beatsPerBar && u === state.noteUnit) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Update Meter Text display
 */
function updateMeterDisplay() {
  const meterLabel = document.getElementById('meter-label');
  const meterCounter = document.getElementById('meter-counter-display');
  if (meterLabel) {
    let name = `${state.beatsPerBar}/${state.noteUnit}`;
    if (state.beatsPerBar === 4 && state.noteUnit === 4) name += ' Common Time';
    else if (state.beatsPerBar === 3 && state.noteUnit === 4) name += ' Waltz Time';
    else if (state.beatsPerBar === 2 && state.noteUnit === 4) name += ' March Time';
    else if (state.beatsPerBar === 6 && state.noteUnit === 8) name += ' Compound Duple';
    meterLabel.textContent = name;
  }
  if (meterCounter) {
    meterCounter.innerHTML = `Beat <strong id="beat-counter" style="color: var(--accent); font-family: monospace;">1</strong> of ${state.beatsPerBar}`;
  }
}

/**
 * Set Beat Subdivisions
 */
function setSubdivision(sub) {
  state.subdivision = parseInt(sub, 10) || 1;
  state.currentSubBeat = 0;

  const label = document.getElementById('subdivision-label');
  if (label) {
    switch (state.subdivision) {
      case 1: label.textContent = 'Quarter Notes (1×)'; break;
      case 2: label.textContent = 'Eighth Notes (2×)'; break;
      case 3: label.textContent = 'Triplets (3×)'; break;
      case 4: label.textContent = 'Sixteenths (4×)'; break;
    }
  }

  document.querySelectorAll('#subdivision-selector .select-toggle-btn').forEach(btn => {
    if (parseInt(btn.dataset.sub, 10) === state.subdivision) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Render Interactive Beat LED Dots Strip
 */
function renderBeatLedStrip() {
  const strip = document.getElementById('beat-indicators');
  if (!strip) return;

  strip.innerHTML = '';
  for (let i = 0; i < state.beatsPerBar; i++) {
    const dot = document.createElement('div');
    dot.className = 'beat-dot';
    dot.id = `beat-dot-${i}`;
    dot.dataset.beatIndex = i;
    dot.title = `Beat ${i + 1}: Click to cycle accent level`;

    const accent = state.beatAccents[i] !== undefined ? state.beatAccents[i] : ACCENT_REGULAR;
    applyDotAccentClass(dot, accent);

    const numSpan = document.createElement('span');
    numSpan.className = 'dot-number';
    numSpan.textContent = i + 1;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'dot-type-icon';
    iconSpan.innerHTML = getAccentSymbol(accent);

    dot.appendChild(numSpan);
    dot.appendChild(iconSpan);

    // Interactive accent cycling
    dot.addEventListener('click', () => {
      cycleBeatAccent(i);
    });

    strip.appendChild(dot);
  }
}

/**
 * Cycle beat accent level: Downbeat (0) -> Regular (1) -> Soft (2) -> Mute (3) -> Downbeat (0)
 */
function cycleBeatAccent(beatIndex) {
  let cur = state.beatAccents[beatIndex] !== undefined ? state.beatAccents[beatIndex] : ACCENT_REGULAR;
  cur = (cur + 1) % 4;
  state.beatAccents[beatIndex] = cur;

  const dot = document.getElementById(`beat-dot-${beatIndex}`);
  if (dot) {
    applyDotAccentClass(dot, cur);
    const iconSpan = dot.querySelector('.dot-type-icon');
    if (iconSpan) iconSpan.innerHTML = getAccentSymbol(cur);
  }
}

function applyDotAccentClass(dot, accent) {
  dot.classList.remove('accent-downbeat', 'accent-regular', 'accent-sub', 'accent-muted');
  switch (accent) {
    case ACCENT_DOWNBEAT: dot.classList.add('accent-downbeat'); break;
    case ACCENT_SOFT: dot.classList.add('accent-sub'); break;
    case ACCENT_MUTE: dot.classList.add('accent-muted'); break;
    default: dot.classList.add('accent-regular'); break;
  }
}

function getAccentSymbol(accent) {
  switch (accent) {
    case ACCENT_DOWNBEAT: return '&starf;';
    case ACCENT_SOFT: return '&minus;';
    case ACCENT_MUTE: return '&cross;';
    default: return '&bull;';
  }
}

/**
 * Tap Tempo Engine: Multi-tap moving average calculation with 3s idle reset
 */
function handleTapTempo() {
  const now = performance.now();
  const btn = document.getElementById('btn-tap-tempo');
  const subtext = document.getElementById('tap-tempo-subtext');

  // Trigger tactile button animation
  if (btn) {
    btn.classList.add('tapped-active');
    setTimeout(() => btn.classList.remove('tapped-active'), 120);
  }

  // Check 3-second reset threshold
  if (tapTempoState.tapTimes.length > 0) {
    const lastTap = tapTempoState.tapTimes[tapTempoState.tapTimes.length - 1];
    if (now - lastTap > 3000) {
      tapTempoState.tapTimes = [];
    }
  }

  tapTempoState.tapTimes.push(now);

  // Keep last 8 taps
  if (tapTempoState.tapTimes.length > 8) {
    tapTempoState.tapTimes.shift();
  }

  const tapCount = tapTempoState.tapTimes.length;

  if (tapCount >= 2) {
    // Calculate intervals
    let sumInterval = 0;
    for (let i = 1; i < tapCount; i++) {
      sumInterval += (tapTempoState.tapTimes[i] - tapTempoState.tapTimes[i - 1]);
    }
    const avgInterval = sumInterval / (tapCount - 1);
    const calculatedBpm = Math.round(60000 / avgInterval);

    if (calculatedBpm >= 30 && calculatedBpm <= 300) {
      setBpm(calculatedBpm);
      if (subtext) subtext.textContent = `${calculatedBpm} BPM (${tapCount} taps)`;
    }
  } else {
    if (subtext) subtext.textContent = 'Keep tapping...';
  }

  // Clear previous reset timeout
  if (tapTempoState.resetTimeout) clearTimeout(tapTempoState.resetTimeout);
  tapTempoState.resetTimeout = setTimeout(() => {
    tapTempoState.tapTimes = [];
    if (subtext) subtext.textContent = 'Tap 4 times';
  }, 3000);
}

/**
 * Synchronized RAF Loop: Visual Beat & Pendulum Engine
 */
function visualAnimationLoop(timestamp) {
  const ctx = audioCtx;
  const nowAudio = ctx ? ctx.currentTime : 0;

  // Process queued visual events that have arrived
  while (visualQueue.length > 0 && visualQueue[0].time <= nowAudio + 0.015) {
    const event = visualQueue.shift();
    triggerVisualBeat(event);
  }

  // Render swinging pendulum physics canvas
  renderPendulumCanvas(timestamp, nowAudio);

  requestAnimationFrame(visualAnimationLoop);
}

/**
 * Trigger visual indicators on exact beat tick
 */
function triggerVisualBeat(event) {
  // Update bar & beat counters
  const barCounter = document.getElementById('bar-counter');
  const beatCounter = document.getElementById('beat-counter');
  const subCounter = document.getElementById('sub-counter');

  if (barCounter) barCounter.textContent = event.bar;
  if (beatCounter) beatCounter.textContent = event.beat + 1;
  if (subCounter) subCounter.textContent = `${event.subBeat + 1}/${state.subdivision}`;

  // Only highlight LED dots & screen flash on main beats (not sub-divisions)
  if (event.subBeat === 0) {
    const dot = document.getElementById(`beat-dot-${event.beat}`);
    clearBeatHighlights();

    if (dot) {
      dot.classList.add('active-beat');
    }

    // Visual Screen Flash
    if (state.visualFlash) {
      const flashOverlay = document.getElementById('flash-overlay');
      if (flashOverlay) {
        flashOverlay.className = 'flash-overlay';
        if (event.accent === ACCENT_DOWNBEAT && state.downbeatAccent) {
          flashOverlay.classList.add('flash-downbeat');
        } else {
          flashOverlay.classList.add('flash-beat');
        }
        setTimeout(() => {
          flashOverlay.className = 'flash-overlay';
        }, 100);
      }
    }
  }
}

function clearBeatHighlights() {
  document.querySelectorAll('.beat-dot').forEach(d => d.classList.remove('active-beat'));
}

/**
 * Animated Swinging Pendulum Canvas Renderer
 * Mathematically modeled inverted mechanical metronome with sliding bob weight
 */
function renderPendulumCanvas(timestamp, nowAudio) {
  if (!pendulumCtx || !pendulumCanvas) return;

  const dpr = window.devicePixelRatio || 1;
  const w = pendulumCanvas.logicalWidth || 340;
  const h = pendulumCanvas.logicalHeight || 270;
  const ctx = pendulumCtx;

  ctx.save();
  // Ensure crisp transform relative to DPR
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // Pendulum Pivot Coordinates at bottom center
  const pivotX = w / 2;
  const pivotY = h - 38;
  const rodLength = h * 0.76;
  const maxAngle = 0.44; // ~25 degrees peak swing

  if (state.isPlaying && nowAudio > 0) {
    // Physical escapement motion:
    // Beat ticks happen at extreme swings (reversal points)
    // T = 2 * (60 / BPM) seconds per full period (left to right and back)
    const beatInterval = 60.0 / state.bpm;
    const elapsed = nowAudio - pendulumStartTime;
    // Cosine reaches maximum at elapsed = 0 (Beat 1), negative peak at Beat 2, positive at Beat 3
    const phase = (Math.PI * elapsed) / beatInterval;
    pendulumTargetAngle = maxAngle * Math.cos(phase);
    pendulumAngle = pendulumTargetAngle;
  } else {
    // Damped relaxation to vertical center equilibrium
    pendulumAngle *= 0.90;
    if (Math.abs(pendulumAngle) < 0.001) pendulumAngle = 0;
  }

  // 1. Draw Metronome Background Housing Silhouette (Pyramid structure)
  ctx.beginPath();
  const topW = 90;
  const botW = 240;
  const topY = 24;
  const botY = h - 16;
  ctx.moveTo(pivotX - topW / 2, topY);
  ctx.lineTo(pivotX + topW / 2, topY);
  ctx.lineTo(pivotX + botW / 2, botY);
  ctx.lineTo(pivotX - botW / 2, botY);
  ctx.closePath();

  // Glassmorphic casing gradient
  const bgGrad = ctx.createLinearGradient(0, topY, 0, botY);
  bgGrad.addColorStop(0, 'rgba(30, 36, 48, 0.6)');
  bgGrad.addColorStop(1, 'rgba(15, 18, 25, 0.85)');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.stroke();

  // 2. Draw Speed Arc Scale & Tempo Notches
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, rodLength * 0.85, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
  ctx.strokeStyle = 'rgba(137, 170, 204, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Graduation Notches along scale
  const notches = [-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4];
  notches.forEach(angle => {
    const rad = -Math.PI / 2 + angle;
    const r1 = rodLength * 0.82;
    const r2 = rodLength * 0.88;
    ctx.beginPath();
    ctx.moveTo(pivotX + r1 * Math.cos(rad), pivotY + r1 * Math.sin(rad));
    ctx.lineTo(pivotX + r2 * Math.cos(rad), pivotY + r2 * Math.sin(rad));
    ctx.strokeStyle = (angle === 0) ? 'rgba(245, 158, 11, 0.6)' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = (angle === 0) ? 2 : 1;
    ctx.stroke();
  });

  // Vertical Center Reference Hairline
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.moveTo(pivotX, topY + 12);
  ctx.lineTo(pivotX, pivotY - 10);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. Draw Swinging Pendulum Rod
  const rodAngle = -Math.PI / 2 + pendulumAngle;
  const tipX = pivotX + rodLength * Math.cos(rodAngle);
  const tipY = pivotY + rodLength * Math.sin(rodAngle);

  // Rod shadow
  ctx.beginPath();
  ctx.moveTo(pivotX + 2, pivotY + 2);
  ctx.lineTo(tipX + 2, tipY + 2);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Brushed Chrome/Steel Rod
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX, tipY);
  const rodGrad = ctx.createLinearGradient(pivotX, pivotY, tipX, tipY);
  rodGrad.addColorStop(0, '#94a3b8');
  rodGrad.addColorStop(0.5, '#f8fafc');
  rodGrad.addColorStop(1, '#64748b');
  ctx.strokeStyle = rodGrad;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 4. Draw Sliding Brass Bob Weight
  // In physical metronomes, Bob weight slides near top at 30 BPM and near pivot at 300 BPM
  const bobRatio = 0.88 - ((state.bpm - 30) / (300 - 30)) * 0.64;
  const bobDistance = rodLength * bobRatio;
  const bobX = pivotX + bobDistance * Math.cos(rodAngle);
  const bobY = pivotY + bobDistance * Math.sin(rodAngle);

  ctx.save();
  ctx.translate(bobX, bobY);
  ctx.rotate(rodAngle + Math.PI / 2);

  // Bob shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(-15, -12, 30, 24);

  // Brass/Gold Bob gradient
  const bobGrad = ctx.createLinearGradient(-14, 0, 14, 0);
  bobGrad.addColorStop(0, '#d97706');
  bobGrad.addColorStop(0.3, '#fde68a');
  bobGrad.addColorStop(0.7, '#f59e0b');
  bobGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = bobGrad;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-14, -12, 28, 24, 4);
  } else {
    ctx.rect(-14, -12, 28, 24);
  }
  ctx.fill();

  // Polished center line marker
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(14, 0);
  ctx.stroke();

  // Thumb screw knob at top of bob
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(0, -13, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 5. Fixed Pivot Hub with Metallic Concentric Rings at Bottom
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(137, 170, 204, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 7, 0, Math.PI * 2);
  const hubGrad = ctx.createRadialGradient(pivotX - 2, pivotY - 2, 1, pivotX, pivotY, 7);
  hubGrad.addColorStop(0, '#cbd5e1');
  hubGrad.addColorStop(1, '#475569');
  ctx.fillStyle = hubGrad;
  ctx.fill();

  ctx.restore();
}

/**
 * Practice Timer Controller
 */
function startPracticeTimer() {
  if (state.timerIntervalId) clearInterval(state.timerIntervalId);
  const badge = document.getElementById('practice-timer-badge');
  if (badge) {
    badge.className = 'trainer-status-badge active';
    badge.textContent = state.timerModeMinutes > 0 ? 'Countdown Active' : 'Stopwatch Running';
  }

  state.timerIntervalId = setInterval(() => {
    state.timerElapsedSeconds++;

    if (state.timerModeMinutes > 0) {
      // Countdown mode
      const totalSeconds = state.timerModeMinutes * 60;
      const remainingSeconds = Math.max(0, totalSeconds - state.timerElapsedSeconds);
      updateTimerDisplay(remainingSeconds);

      if (remainingSeconds <= 0 && !state.timerCompleted) {
        state.timerCompleted = true;
        stopMetronome();
        playCompletionChime();
        if (badge) {
          badge.className = 'trainer-status-badge';
          badge.textContent = 'Session Complete!';
        }
        showToast('Practice Session Complete! Great job.');
      }
    } else {
      // Stopwatch mode
      updateTimerDisplay(state.timerElapsedSeconds);
    }
  }, 1000);
}

function stopPracticeTimer() {
  if (state.timerIntervalId) {
    clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }
  const badge = document.getElementById('practice-timer-badge');
  if (badge && !state.timerCompleted) {
    badge.className = 'trainer-status-badge';
    badge.textContent = 'Paused';
  }
}

function resetPracticeTimer() {
  stopPracticeTimer();
  state.timerElapsedSeconds = 0;
  state.timerCompleted = false;
  const select = document.getElementById('practice-timer-select');
  state.timerModeMinutes = select ? parseInt(select.value, 10) : 0;
  
  if (state.timerModeMinutes > 0) {
    updateTimerDisplay(state.timerModeMinutes * 60);
  } else {
    updateTimerDisplay(0);
  }

  const badge = document.getElementById('practice-timer-badge');
  if (badge) {
    badge.className = 'trainer-status-badge';
    badge.textContent = 'Ready';
  }
}

function updateTimerDisplay(totalSeconds) {
  const display = document.getElementById('practice-timer-display');
  if (!display) return;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 3-Tone Session Completion Chime
 */
function playCompletionChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(freq, now + idx * 0.15);
    gain.gain.setValueAtTime(0.001, now + idx * 0.15);
    gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.15 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.15);
    osc.stop(now + idx * 0.15 + 0.65);
  });
}

/**
 * UI Play Button State updater
 */
function updatePlayButtonUI() {
  const btn = document.getElementById('btn-toggle-play');
  const playIcon = document.getElementById('play-icon');
  const stopIcon = document.getElementById('stop-icon');
  const text = document.getElementById('play-btn-text');

  if (state.isPlaying) {
    if (btn) btn.classList.add('is-playing');
    if (playIcon) playIcon.style.display = 'none';
    if (stopIcon) stopIcon.style.display = 'block';
    if (text) text.textContent = 'Stop Metronome';
  } else {
    if (btn) btn.classList.remove('is-playing');
    if (playIcon) playIcon.style.display = 'block';
    if (stopIcon) stopIcon.style.display = 'none';
    if (text) text.textContent = 'Start Metronome';
  }
}

/**
 * Temporary floating toast notification
 */
function showToast(message) {
  let toast = document.getElementById('metronome-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'metronome-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.zIndex = '9999';
    toast.style.background = 'var(--surface)';
    toast.style.color = 'var(--text-primary)';
    toast.style.padding = '0.75rem 1.25rem';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.border = '1px solid var(--accent)';
    toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    toast.style.fontSize = '0.875rem';
    toast.style.fontWeight = '600';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2500);
}

/**
 * Initialize Canvas with high-DPI retina sharpness
 */
function initPendulumCanvas() {
  pendulumCanvas = document.getElementById('pendulum-canvas');
  if (!pendulumCanvas) return;
  pendulumCtx = pendulumCanvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  const rect = pendulumCanvas.getBoundingClientRect();
  const cssWidth = rect.width > 0 ? rect.width : 340;
  const cssHeight = rect.height > 0 ? rect.height : 270;

  pendulumCanvas.width = Math.round(cssWidth * dpr);
  pendulumCanvas.height = Math.round(cssHeight * dpr);
  pendulumCanvas.logicalWidth = cssWidth;
  pendulumCanvas.logicalHeight = cssHeight;
}

/**
 * Setup All Event Listeners & Controls
 */
function initEventListeners() {
  // Play / Stop button
  const playBtn = document.getElementById('btn-toggle-play');
  if (playBtn) playBtn.addEventListener('click', togglePlay);

  // Tap Tempo button
  const tapBtn = document.getElementById('btn-tap-tempo');
  if (tapBtn) tapBtn.addEventListener('click', handleTapTempo);

  // BPM Slider & Numerical Input synchronization
  const bpmInput = document.getElementById('bpm-input');
  const bpmSlider = document.getElementById('bpm-slider');

  if (bpmInput) {
    bpmInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) setBpm(val);
    });
    bpmInput.addEventListener('blur', () => {
      setBpm(parseInt(bpmInput.value, 10) || 120);
    });
  }

  if (bpmSlider) {
    bpmSlider.addEventListener('input', (e) => {
      setBpm(parseInt(e.target.value, 10));
    });
  }

  // Quick tempo step buttons (-10, -5, -1, +1, +5, +10)
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.step, 10);
      stepBpm(step);
    });
  });

  // Italian tempo preset pills
  document.querySelectorAll('.preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const bpm = parseInt(pill.dataset.bpm, 10);
      setBpm(bpm);
    });
  });

  // Time signature selector buttons
  document.querySelectorAll('#time-signature-selector .select-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeSignature(btn.dataset.beats, btn.dataset.unit);
    });
  });

  // Subdivision selector buttons
  document.querySelectorAll('#subdivision-selector .select-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setSubdivision(btn.dataset.sub);
    });
  });

  // Sound preset dropdown
  const soundSelect = document.getElementById('sound-preset-select');
  if (soundSelect) {
    soundSelect.addEventListener('change', (e) => {
      state.soundPreset = e.target.value;
    });
  }

  // Pitch level dropdown
  const pitchSelect = document.getElementById('pitch-level-select');
  if (pitchSelect) {
    pitchSelect.addEventListener('change', (e) => {
      state.pitchSetting = e.target.value;
    });
  }

  // Volume slider
  const volumeSlider = document.getElementById('volume-slider');
  const volumeValue = document.getElementById('volume-value');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      state.volume = parseInt(e.target.value, 10) / 100;
      if (volumeValue) volumeValue.textContent = `${e.target.value}%`;
      if (state.volume > 0 && state.isMuted) {
        state.isMuted = false;
        updateMuteButtonUI();
      }
    });
  }

  // Mute button
  const muteBtn = document.getElementById('btn-toggle-mute');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      state.isMuted = !state.isMuted;
      updateMuteButtonUI();
    });
  }

  // Downbeat accent toggle
  const accentCheck = document.getElementById('check-accent-downbeat');
  if (accentCheck) {
    accentCheck.addEventListener('change', (e) => {
      state.downbeatAccent = e.target.checked;
    });
  }

  // Visual flash toggle
  const flashCheck = document.getElementById('check-visual-flash');
  if (flashCheck) {
    flashCheck.addEventListener('change', (e) => {
      state.visualFlash = e.target.checked;
    });
  }

  // Italian tempo marking badge click scrolls to reference table
  const badge = document.getElementById('tempo-marking-badge');
  if (badge) {
    badge.addEventListener('click', () => {
      const table = document.getElementById('tempo-reference-table');
      if (table) table.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Reference Table Clickable Rows
  document.querySelectorAll('#tempo-reference-table .clickable-row').forEach(row => {
    row.addEventListener('click', () => {
      const bpm = parseInt(row.dataset.bpm, 10);
      if (bpm) setBpm(bpm);
    });
  });

  // Practice Timer select & reset
  const timerSelect = document.getElementById('practice-timer-select');
  if (timerSelect) {
    timerSelect.addEventListener('change', () => {
      resetPracticeTimer();
    });
  }
  const resetTimerBtn = document.getElementById('btn-reset-timer');
  if (resetTimerBtn) {
    resetTimerBtn.addEventListener('click', resetPracticeTimer);
  }

  // Speed Trainer Controls
  const trainerCheck = document.getElementById('check-speed-trainer');
  const trainerBadge = document.getElementById('trainer-status-badge');
  if (trainerCheck) {
    trainerCheck.addEventListener('change', (e) => {
      state.speedTrainerEnabled = e.target.checked;
      if (trainerBadge) {
        if (state.speedTrainerEnabled) {
          trainerBadge.className = 'trainer-status-badge active';
          trainerBadge.textContent = 'Active';
        } else {
          trainerBadge.className = 'trainer-status-badge';
          trainerBadge.textContent = 'Disabled';
        }
      }
    });
  }

  const stepSelect = document.getElementById('trainer-step-select');
  if (stepSelect) {
    stepSelect.addEventListener('change', (e) => {
      state.trainerStep = parseInt(e.target.value, 10);
    });
  }

  const barsSelect = document.getElementById('trainer-bars-select');
  if (barsSelect) {
    barsSelect.addEventListener('change', (e) => {
      state.trainerBars = parseInt(e.target.value, 10);
    });
  }

  const targetInput = document.getElementById('trainer-target-bpm');
  if (targetInput) {
    targetInput.addEventListener('change', (e) => {
      state.trainerTargetBpm = Math.max(40, Math.min(300, parseInt(e.target.value, 10) || 160));
    });
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ignore keystrokes when editing form inputs
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
      if (e.code === 'Space' && activeEl.id === 'bpm-input') {
        // Blur BPM input on space
        activeEl.blur();
      } else {
        return;
      }
    }

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      handleTapTempo();
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      stepBpm(e.shiftKey ? 5 : 1);
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      stepBpm(e.shiftKey ? -5 : -1);
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      state.isMuted = !state.isMuted;
      updateMuteButtonUI();
    }
  });

  // Window resize responsiveness
  window.addEventListener('resize', () => {
    initPendulumCanvas();
  });
}

function updateMuteButtonUI() {
  const muteBtn = document.getElementById('btn-toggle-mute');
  if (!muteBtn) return;
  if (state.isMuted) {
    muteBtn.textContent = 'Unmute';
    muteBtn.style.color = 'var(--error)';
    muteBtn.style.borderColor = 'var(--error)';
  } else {
    muteBtn.textContent = 'Mute';
    muteBtn.style.color = '';
    muteBtn.style.borderColor = '';
  }
}

/**
 * Main Initialization on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initPendulumCanvas();
  renderBeatLedStrip();
  updateMeterDisplay();
  setBpm(120);
  initEventListeners();

  // Start RAF visual rendering loop
  requestAnimationFrame(visualAnimationLoop);
});