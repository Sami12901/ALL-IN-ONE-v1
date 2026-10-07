// Audio Branding Studio & Sonic Logo Synthesizer
// 100% Client-Side Web Audio API Multi-Layer Synthesis & WAV Mastering

let audioCtx = null;
let currentBuffer = null;
let currentSource = null;
let isPlaying = false;
let analyserNode = null;
let animFrameId = null;

const NOTE_FREQS = {
  'C2': 65.41, 'E2': 82.41, 'G2': 98.00, 'A2': 110.00, 'C3': 130.81, 'D3': 146.83,
  'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94, 'C4': 261.63,
  'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99, 'A5': 880.00, 'C6': 1046.50
};

const SCALES = {
  'C-maj': ['C3', 'E3', 'G3', 'C4', 'E4', 'G4', 'C5'],
  'D-lydian': ['D3', 'F#4', 'A4', 'C5', 'E5'],
  'E-min': ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  'F-maj': ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  'G-pent': ['G3', 'A3', 'B3', 'D4', 'E4', 'G4', 'B4'],
  'A-maj': ['A2', 'E3', 'A3', 'C#4', 'E4', 'A4']
};

const ARCHETYPE_CONFIGS = {
  'luxury-minimal': {
    key: 'C-maj',
    cadence: 'ambient-bloom',
    duration: 3.5,
    reverb: 75,
    layers: { bell: true, sub: true, shimmer: true, transient: false },
    specKey: 'C Major Purity',
    specVibe: 'Prestige, Elegance, Subtle Confidence',
    specFreq: '32 Hz - 7,800 Hz',
    specUsage: 'Luxury Flagship, Fine Fragrance, High-End EV'
  },
  'tech-future': {
    key: 'D-lydian',
    cadence: 'ascending',
    duration: 2.5,
    reverb: 50,
    layers: { bell: true, sub: true, shimmer: true, transient: true },
    specKey: 'D Lydian Modern',
    specVibe: 'Innovation, Speed, Hyper-Connectivity',
    specFreq: '40 Hz - 14,200 Hz',
    specUsage: 'SaaS App Open, Operating System Boot, AI Device'
  },
  'cinema-epic': {
    key: 'E-min',
    cadence: 'dual-strike',
    duration: 4.5,
    reverb: 85,
    layers: { bell: false, sub: true, shimmer: true, transient: true },
    specKey: 'E Minor Cinematic',
    specVibe: 'Depth, Gravity, Narrative Suspense',
    specFreq: '28 Hz - 6,500 Hz',
    specUsage: 'Streaming Intro, Movie Studio Splash, Game Studio'
  },
  'energetic-vibes': {
    key: 'G-pent',
    cadence: 'four-note',
    duration: 2.0,
    reverb: 40,
    layers: { bell: true, sub: true, shimmer: true, transient: true },
    specKey: 'G Pentatonic Pop',
    specVibe: 'Optimism, Freshness, Agility',
    specFreq: '55 Hz - 12,000 Hz',
    specUsage: 'Creator Channels, Consumer Apps, Mobile Games'
  },
  'warm-organic': {
    key: 'F-maj',
    cadence: 'resolution',
    duration: 3.0,
    reverb: 60,
    layers: { bell: true, sub: false, shimmer: true, transient: false },
    specKey: 'F Major Resonance',
    specVibe: 'Humanity, Hospitality, Trust & Care',
    specFreq: '60 Hz - 9,000 Hz',
    specUsage: 'Wellness Brands, Eco Tech, Artisanal Retail'
  },
  'fintech-trust': {
    key: 'C-maj',
    cadence: 'resolution',
    duration: 1.8,
    reverb: 35,
    layers: { bell: true, sub: true, shimmer: false, transient: true },
    specKey: 'C Major Stable',
    specVibe: 'Security, Approval, Instant Gratification',
    specFreq: '50 Hz - 10,500 Hz',
    specUsage: 'Payment Success Tone, POS Terminals, Banking Cards'
  }
};

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
  view.setUint16(20, 1, true); // PCM
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

// Algorithmic Audio Branding Generator
async function synthesizeBrandIdent(options) {
  const sampleRate = 48000;
  const duration = options.duration;
  const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * duration), sampleRate);

  // Master Gain & Limiter
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.85, 0);

  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-12, 0);
  compressor.knee.setValueAtTime(8, 0);
  compressor.ratio.setValueAtTime(4, 0);
  compressor.attack.setValueAtTime(0.003, 0);
  compressor.release.setValueAtTime(0.25, 0);

  // Simple Synthetic Stereo Reverb Impulse
  const convolver = offlineCtx.createConvolver();
  const revSec = 2.0;
  const revLen = Math.floor(sampleRate * revSec);
  const revBuf = offlineCtx.createBuffer(2, revLen, sampleRate);
  const rL = revBuf.getChannelData(0);
  const rR = revBuf.getChannelData(1);
  const decayFactor = 3.5;
  for (let i = 0; i < revLen; i++) {
    const env = Math.exp(-decayFactor * (i / revLen));
    rL[i] = (Math.random() * 2 - 1) * env;
    rR[i] = (Math.random() * 2 - 1) * env;
  }
  convolver.buffer = revBuf;

  const wetGain = offlineCtx.createGain();
  const dryGain = offlineCtx.createGain();
  const wetAmt = options.reverb / 100 * 0.55;
  wetGain.gain.setValueAtTime(wetAmt, 0);
  dryGain.gain.setValueAtTime(1.0 - wetAmt * 0.5, 0);

  masterGain.connect(dryGain);
  masterGain.connect(convolver);
  convolver.connect(wetGain);

  dryGain.connect(compressor);
  wetGain.connect(compressor);
  compressor.connect(offlineCtx.destination);

  // Determine Notes to Trigger based on scale & cadence
  const scaleNotes = SCALES[options.key] || SCALES['C-maj'];
  let noteEvents = [];

  if (options.cadence === 'ascending') {
    const count = 4;
    const step = 0.22;
    for (let i = 0; i < count; i++) {
      const n = scaleNotes[i % scaleNotes.length];
      const freq = NOTE_FREQS[n] || 261.63;
      noteEvents.push({ time: i * step, freq, dur: 1.2, vel: 0.7 + i * 0.08 });
    }
  } else if (options.cadence === 'resolution') {
    const step = 0.28;
    noteEvents.push({ time: 0.0, freq: NOTE_FREQS[scaleNotes[0]] || 261.63, dur: 0.4, vel: 0.6 });
    noteEvents.push({ time: step, freq: NOTE_FREQS[scaleNotes[2]] || 329.63, dur: 0.4, vel: 0.7 });
    noteEvents.push({ time: step * 2, freq: NOTE_FREQS[scaleNotes[scaleNotes.length - 1]] || 523.25, dur: duration - step * 2, vel: 0.95 });
  } else if (options.cadence === 'dual-strike') {
    noteEvents.push({ time: 0.0, freq: (NOTE_FREQS[scaleNotes[0]] || 261.63) * 0.5, dur: 1.0, vel: 0.85 });
    noteEvents.push({ time: 0.35, freq: NOTE_FREQS[scaleNotes[1]] || 329.63, dur: duration - 0.35, vel: 0.9 });
  } else if (options.cadence === 'ambient-bloom') {
    scaleNotes.forEach((n, idx) => {
      const f = NOTE_FREQS[n] || 261.63;
      noteEvents.push({ time: idx * 0.12, freq: f, dur: duration - idx * 0.12, vel: 0.65 });
    });
  } else {
    // 4-note brand ident (e.g. Intel style cadence)
    const pattern = [0, 2, 1, 3];
    pattern.forEach((idx, i) => {
      const n = scaleNotes[idx % scaleNotes.length];
      const f = NOTE_FREQS[n] || 261.63;
      noteEvents.push({ time: i * 0.24, freq: f, dur: i === 3 ? 1.8 : 0.4, vel: i === 3 ? 1.0 : 0.7 });
    });
  }

  // Layer 1: Crystal Bell Chime (Sine + partial harmonic)
  if (options.layers.bell) {
    noteEvents.forEach(evt => {
      const osc = offlineCtx.createOscillator();
      const oscHarm = offlineCtx.createOscillator();
      const noteGain = offlineCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(evt.freq, evt.time);

      oscHarm.type = 'sine';
      oscHarm.frequency.setValueAtTime(evt.freq * 2.756, evt.time); // metallic bell overtone

      const harmGain = offlineCtx.createGain();
      harmGain.gain.setValueAtTime(0.25, evt.time);
      harmGain.gain.exponentialRampToValueAtTime(0.001, evt.time + evt.dur * 0.4);

      noteGain.gain.setValueAtTime(0.0001, evt.time);
      noteGain.gain.linearRampToValueAtTime(evt.vel * 0.4, evt.time + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, evt.time + evt.dur);

      osc.connect(noteGain);
      oscHarm.connect(harmGain);
      harmGain.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(evt.time);
      oscHarm.start(evt.time);
      osc.stop(evt.time + evt.dur);
      oscHarm.stop(evt.time + evt.dur);
    });
  }

  // Layer 2: Deep Sub Bass Impact
  if (options.layers.sub) {
    const subOsc = offlineCtx.createOscillator();
    const subGain = offlineCtx.createGain();
    const baseFreq = (NOTE_FREQS[scaleNotes[0]] || 130.81) * 0.5;

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq * 1.5, 0);
    subOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, 0.45);

    subGain.gain.setValueAtTime(0.001, 0);
    subGain.gain.linearRampToValueAtTime(0.65, 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.0001, duration * 0.7);

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(0);
    subOsc.stop(duration);
  }

  // Layer 3: Harmonic FM Shimmer
  if (options.layers.shimmer) {
    noteEvents.forEach(evt => {
      const carrier = offlineCtx.createOscillator();
      const modulator = offlineCtx.createOscillator();
      const modGain = offlineCtx.createGain();
      const shimmerGain = offlineCtx.createGain();

      carrier.type = 'triangle';
      carrier.frequency.setValueAtTime(evt.freq * 2, evt.time);

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(evt.freq * 1.5, evt.time);
      modGain.gain.setValueAtTime(evt.freq * 0.5, evt.time);

      modulator.connect(carrier.frequency);

      shimmerGain.gain.setValueAtTime(0.0001, evt.time);
      shimmerGain.gain.linearRampToValueAtTime(0.18, evt.time + 0.05);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, evt.time + evt.dur * 0.8);

      carrier.connect(shimmerGain);
      shimmerGain.connect(masterGain);

      carrier.start(evt.time);
      modulator.start(evt.time);
      carrier.stop(evt.time + evt.dur);
      modulator.stop(evt.time + evt.dur);
    });
  }

  // Layer 4: Metallic Transient Click
  if (options.layers.transient) {
    const clickBuf = offlineCtx.createBuffer(1, Math.floor(sampleRate * 0.05), sampleRate);
    const data = clickBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
    }
    const clickSrc = offlineCtx.createBufferSource();
    clickSrc.buffer = clickBuf;

    const clickFilter = offlineCtx.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(4500, 0);

    const clickGain = offlineCtx.createGain();
    clickGain.gain.setValueAtTime(0.35, 0);

    clickSrc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(masterGain);
    clickSrc.start(0);
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return renderedBuffer;
}

// Visualizer Rendering Loop
function initVisualizer() {
  const canvas = document.getElementById('visualizer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function draw() {
    animFrameId = requestAnimationFrame(draw);
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(4, 7, 13, 0.25)';
    ctx.fillRect(0, 0, width, height);

    if (!analyserNode || !isPlaying) {
      // Draw resting glowing horizon line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    const barWidth = (width / (bufferLength * 0.5)) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength * 0.5; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.85;

      const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.6, '#3b82f6');
      grad.addColorStop(1, '#a855f7');

      ctx.fillStyle = grad;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

      // Mirror subtle glow downwards
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(x, height / 2, barWidth - 1, barHeight * 0.2);

      x += barWidth;
    }
  }
  draw();
}

// Main Controller Initialization
document.addEventListener('DOMContentLoaded', () => {
  const brandPreset = document.getElementById('brand-preset');
  const musicalKey = document.getElementById('musical-key');
  const brandCadence = document.getElementById('brand-cadence');
  const brandDuration = document.getElementById('brand-duration');
  const valDuration = document.getElementById('val-duration');
  const reverbSpace = document.getElementById('reverb-space');
  const valReverb = document.getElementById('val-reverb');

  const layerBell = document.getElementById('layer-bell');
  const layerSub = document.getElementById('layer-sub');
  const layerShimmer = document.getElementById('layer-shimmer');
  const layerTransient = document.getElementById('layer-transient');

  const voiceWhisper = document.getElementById('voice-whisper');
  const enableVoice = document.getElementById('enable-voice');

  const btnGenerate = document.getElementById('btn-generate');
  const btnRandomize = document.getElementById('btn-randomize');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const txtPlay = document.getElementById('txt-play');
  const btnDownloadWav = document.getElementById('btn-download-wav');
  const audioStatusBadge = document.getElementById('audio-status-badge');
  const visualizerHint = document.getElementById('visualizer-hint');

  const specKey = document.getElementById('spec-key');
  const specArchetype = document.getElementById('spec-archetype');
  const specFreq = document.getElementById('spec-freq');
  const specVibe = document.getElementById('spec-vibe');
  const specUsage = document.getElementById('spec-usage');

  initVisualizer();

  // Slider change updates
  brandDuration.addEventListener('input', () => {
    valDuration.textContent = `${parseFloat(brandDuration.value).toFixed(1)}s`;
  });
  reverbSpace.addEventListener('input', () => {
    valReverb.textContent = `${reverbSpace.value}%`;
  });

  // Apply archetype preset helper
  function applyPreset(key) {
    const config = ARCHETYPE_CONFIGS[key];
    if (!config) return;

    brandPreset.value = key;
    musicalKey.value = config.key;
    brandCadence.value = config.cadence;
    brandDuration.value = config.duration;
    valDuration.textContent = `${config.duration.toFixed(1)}s`;
    reverbSpace.value = config.reverb;
    valReverb.textContent = `${config.reverb}%`;

    layerBell.checked = config.layers.bell;
    layerSub.checked = config.layers.sub;
    layerShimmer.checked = config.layers.shimmer;
    layerTransient.checked = config.layers.transient;

    specKey.textContent = config.specKey;
    specArchetype.textContent = key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    specFreq.textContent = config.specFreq;
    specVibe.textContent = config.specVibe;
    specUsage.textContent = config.specUsage;
  }

  brandPreset.addEventListener('change', () => {
    if (brandPreset.value !== 'custom') {
      applyPreset(brandPreset.value);
    }
  });

  document.querySelectorAll('.btn-quick-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-preset');
      applyPreset(p);
      generateAudio();
    });
  });

  // AI Surprise Generator
  btnRandomize.addEventListener('click', () => {
    const keys = Object.keys(ARCHETYPE_CONFIGS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    applyPreset(randomKey);

    // Randomize duration slightly
    const dur = (Math.floor(Math.random() * 8) * 0.5 + 1.5).toFixed(1);
    brandDuration.value = dur;
    valDuration.textContent = `${dur}s`;

    generateAudio();
  });

  async function generateAudio() {
    audioStatusBadge.textContent = 'Synthesizing...';
    audioStatusBadge.style.color = 'var(--accent)';

    const opts = {
      key: musicalKey.value,
      cadence: brandCadence.value,
      duration: parseFloat(brandDuration.value),
      reverb: parseInt(reverbSpace.value, 10),
      layers: {
        bell: layerBell.checked,
        sub: layerSub.checked,
        shimmer: layerShimmer.checked,
        transient: layerTransient.checked
      }
    };

    try {
      currentBuffer = await synthesizeBrandIdent(opts);
      audioStatusBadge.textContent = 'Rendered OK';
      audioStatusBadge.style.color = '#10b981';
      btnPlayPause.disabled = false;
      btnDownloadWav.disabled = false;
      if (visualizerHint) visualizerHint.style.display = 'none';

      playAudio();
    } catch (err) {
      console.error(err);
      audioStatusBadge.textContent = 'Error rendering';
      audioStatusBadge.style.color = 'var(--error)';
    }
  }

  btnGenerate.addEventListener('click', generateAudio);

  function stopAudio() {
    if (currentSource) {
      try { currentSource.stop(); } catch (e) {}
      currentSource.disconnect();
      currentSource = null;
    }
    isPlaying = false;
    txtPlay.textContent = 'Play Preview';
  }

  function playAudio() {
    if (!currentBuffer) return;
    stopAudio();

    const ctx = getAudioContext();
    currentSource = ctx.createBufferSource();
    currentSource.buffer = currentBuffer;

    if (!analyserNode) {
      analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
    }

    currentSource.connect(analyserNode);
    analyserNode.connect(ctx.destination);

    currentSource.onended = () => {
      isPlaying = false;
      txtPlay.textContent = 'Play Preview';
    };

    currentSource.start();
    isPlaying = true;
    txtPlay.textContent = 'Stop Preview';

    // Optional tagline voiceover
    if (enableVoice.checked && voiceWhisper.value.trim() && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(voiceWhisper.value.trim());
      utter.rate = 0.9;
      utter.pitch = 1.0;
      setTimeout(() => {
        window.speechSynthesis.speak(utter);
      }, 500);
    }
  }

  btnPlayPause.addEventListener('click', () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  });

  btnDownloadWav.addEventListener('click', () => {
    if (!currentBuffer) return;
    const wavBlob = audioBufferToWavBlob(currentBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    const nameSlug = brandPreset.value || 'brand-sonic-logo';
    a.download = `${nameSlug}-identity.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});