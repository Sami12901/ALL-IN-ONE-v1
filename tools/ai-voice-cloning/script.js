// AI Voice Cloning & Acoustic Profile Studio - Client-Side Profiler & Resonator DSP
// Pure Web Audio API & Web Speech API - Zero External Dependencies

let audioCtx = null;
let referenceBuffer = null;
let referenceSource = null;
let clonedBuffer = null;
let clonedSource = null;
let isSynthesizing = false;
let animFrameId = null;

let acousticProfile = {
  pitchF0: 145,
  formantF1: 520,
  formantF2: 1750,
  brightness: 58,
  classification: 'Warm Tenor'
};

const ARCHETYPE_PROFILES = {
  baritone: { pitchF0: 105, formantF1: 420, formantF2: 1350, brightness: 42, classification: 'Deep Baritone' },
  tenor: { pitchF0: 155, formantF1: 540, formantF2: 1820, brightness: 58, classification: 'Warm Tenor' },
  alto: { pitchF0: 210, formantF1: 650, formantF2: 2100, brightness: 68, classification: 'Crisp Alto' },
  soprano: { pitchF0: 260, formantF1: 780, formantF2: 2500, brightness: 82, classification: 'Bright Soprano' }
};

function getAudioContext() {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

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

// Analyze Acoustic Features of Audio Buffer
function analyzeAcoustics(buffer) {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const n = Math.min(channelData.length, sampleRate * 4); // Analyze first 4 seconds

  // 1. Fundamental frequency (F0) estimation via autocorrelation
  let bestOffset = -1;
  let maxCorr = 0;
  const minPeriod = Math.floor(sampleRate / 400); // 400 Hz max pitch
  const maxPeriod = Math.floor(sampleRate / 70);  // 70 Hz min pitch

  for (let offset = minPeriod; offset < maxPeriod; offset += 2) {
    let corr = 0;
    for (let i = 0; i < n - offset; i += 4) {
      corr += channelData[i] * channelData[i + offset];
    }
    if (corr > maxCorr) {
      maxCorr = corr;
      bestOffset = offset;
    }
  }

  let f0 = bestOffset > 0 ? Math.round(sampleRate / bestOffset) : 150;
  if (f0 < 70 || f0 > 450) f0 = 150;

  // 2. Spectral Centroid / Brightness
  let zeroCrossings = 0;
  for (let i = 1; i < n; i++) {
    if ((channelData[i] >= 0 && channelData[i - 1] < 0) || (channelData[i] < 0 && channelData[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const brightness = Math.min(95, Math.max(25, Math.round((zeroCrossings / n) * 1200)));

  // Formants approximation from F0
  const f1 = Math.round(f0 * 3.4);
  const f2 = Math.round(f0 * 11.2);

  // Classification
  let classification = 'Warm Tenor';
  if (f0 < 130) classification = 'Deep Baritone';
  else if (f0 < 175) classification = 'Warm Tenor';
  else if (f0 < 225) classification = 'Crisp Alto';
  else classification = 'Bright Soprano';

  return {
    pitchF0: f0,
    formantF1: f1,
    formantF2: f2,
    brightness: brightness,
    classification: classification
  };
}

// Synthesize Voice Acoustic Sample Buffer for Presets
function synthesizeArchetypeBuffer(profile) {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const dur = 4.0;
  const buf = ctx.createBuffer(1, Math.floor(sampleRate * dur), sampleRate);
  const data = buf.getChannelData(0);
  const f0 = profile.pitchF0;

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const voiceEnv = Math.sin(Math.PI * (t / dur));
    const syllable = Math.sin(2 * Math.PI * 3.5 * t) * 0.5 + 0.5;
    const base = Math.sin(2 * Math.PI * f0 * t);
    const harm1 = Math.sin(2 * Math.PI * profile.formantF1 * t) * 0.35;
    const harm2 = Math.sin(2 * Math.PI * profile.formantF2 * t) * 0.2;
    data[i] = (base + harm1 + harm2) * voiceEnv * syllable * 0.45;
  }
  return buf;
}

// Synthesize Cloned Speech Audio with DSP Filter Chain
async function renderClonedSpeechAudio(text, profile, formantGainDb, warmth) {
  const sampleRate = 48000;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const estDuration = Math.max(2.0, (words.length / 130) * 60 + 0.6);
  const totalSamples = Math.ceil(sampleRate * estDuration);

  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

  const master = offlineCtx.createGain();
  master.gain.setValueAtTime(0.8, 0);

  // Base vocal cord oscillator
  const osc = offlineCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(profile.pitchF0, 0);

  // Subtle natural pitch fluctuation
  const vibrato = offlineCtx.createOscillator();
  const vibGain = offlineCtx.createGain();
  vibrato.frequency.setValueAtTime(5.4, 0);
  vibGain.gain.setValueAtTime(profile.pitchF0 * 0.015, 0);
  vibrato.connect(osc.frequency);
  vibrato.start(0);

  // Syllabic envelope matching words
  const syllEnv = offlineCtx.createGain();
  syllEnv.gain.setValueAtTime(0.001, 0);
  const step = estDuration / Math.max(1, words.length);
  for (let w = 0; w < words.length; w++) {
    const t0 = w * step + 0.02;
    const t1 = t0 + step * 0.8;
    syllEnv.gain.setValueAtTime(0.001, t0);
    syllEnv.gain.linearRampToValueAtTime(0.7, t0 + 0.04);
    syllEnv.gain.exponentialRampToValueAtTime(0.001, t1);
  }

  // Vocal tract formant peaking filters
  const f1Filter = offlineCtx.createBiquadFilter();
  f1Filter.type = 'peaking';
  f1Filter.frequency.setValueAtTime(profile.formantF1, 0);
  f1Filter.Q.setValueAtTime(4.0, 0);
  f1Filter.gain.setValueAtTime(formantGainDb, 0);

  const f2Filter = offlineCtx.createBiquadFilter();
  f2Filter.type = 'peaking';
  f2Filter.frequency.setValueAtTime(profile.formantF2, 0);
  f2Filter.Q.setValueAtTime(5.0, 0);
  f2Filter.gain.setValueAtTime(formantGainDb * 0.75, 0);

  // Tube Warmth Waveshaper
  const waveShaper = offlineCtx.createWaveShaper();
  const nCurve = 1024;
  const curve = new Float32Array(nCurve);
  const k = (warmth / 100) * 15;
  for (let i = 0; i < nCurve; i++) {
    const x = (i * 2) / nCurve - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  waveShaper.curve = curve;

  // Compressor
  const comp = offlineCtx.createDynamicsCompressor();
  comp.threshold.setValueAtTime(-14, 0);
  comp.ratio.setValueAtTime(4, 0);

  osc.connect(syllEnv);
  syllEnv.connect(f1Filter);
  f1Filter.connect(f2Filter);
  f2Filter.connect(waveShaper);
  waveShaper.connect(comp);
  comp.connect(master);
  master.connect(offlineCtx.destination);

  osc.start(0);
  osc.stop(estDuration);
  vibrato.stop(estDuration);

  return await offlineCtx.startRendering();
}

function initVisualizer() {
  const canvas = document.getElementById('clone-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let phase = 0;
  function draw() {
    animFrameId = requestAnimationFrame(draw);
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(4, 7, 13, 0.3)';
    ctx.fillRect(0, 0, width, height);

    if (!isSynthesizing) {
      // Draw resting formant spectrum curves
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.moveTo(0, height * 0.7);
      for (let x = 0; x < width; x += 10) {
        const norm = x / width;
        const resonance = Math.sin(norm * 12) * 20 * Math.exp(-norm * 2);
        ctx.lineTo(x, height * 0.7 - resonance);
      }
      ctx.stroke();
      return;
    }

    phase += 0.08;
    ctx.lineWidth = 2.5 * window.devicePixelRatio;

    // Resonant wave 1 (Fundamental)
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    for (let x = 0; x < width; x += 4) {
      const norm = x / width;
      const y = height / 2 + Math.sin(norm * 14 + phase) * (height * 0.25) * Math.sin(norm * Math.PI);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Resonant wave 2 (Formant F1/F2)
    ctx.beginPath();
    ctx.strokeStyle = '#a855f7';
    for (let x = 0; x < width; x += 4) {
      const norm = x / width;
      const y = height / 2 + Math.cos(norm * 28 - phase * 1.5) * (height * 0.18) * Math.sin(norm * Math.PI);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  const btnRecordMic = document.getElementById('btn-record-mic');
  const btnUploadFile = document.getElementById('btn-upload-file');
  const sampleFileInput = document.getElementById('sample-file-input');
  const enrollmentStatus = document.getElementById('enrollment-status');

  const statClassification = document.getElementById('stat-classification');
  const statPitch = document.getElementById('stat-pitch');
  const statF1 = document.getElementById('stat-f1');
  const statF2 = document.getElementById('stat-f2');
  const statBrightness = document.getElementById('stat-brightness');

  const referencePlayerBox = document.getElementById('reference-player-box');
  const btnPlayRef = document.getElementById('btn-play-ref');

  const cloneCanvas = document.getElementById('clone-canvas');
  const cloneHint = document.getElementById('clone-hint');
  const cloneStatusBadge = document.getElementById('clone-status-badge');
  const cloneScript = document.getElementById('clone-script');

  const dspFormantGain = document.getElementById('dsp-formant-gain');
  const valDspFormant = document.getElementById('val-dsp-formant');
  const dspWarmth = document.getElementById('dsp-warmth');
  const valDspWarmth = document.getElementById('val-dsp-warmth');

  const btnSpeakCloned = document.getElementById('btn-speak-cloned');
  const btnStopClone = document.getElementById('btn-stop-clone');
  const btnDownloadClonedWav = document.getElementById('btn-download-cloned-wav');
  const btnSaveProfile = document.getElementById('btn-save-profile');

  initVisualizer();

  dspFormantGain.addEventListener('input', () => {
    valDspFormant.textContent = `+${parseFloat(dspFormantGain.value).toFixed(1)} dB`;
  });
  dspWarmth.addEventListener('input', () => {
    valDspWarmth.textContent = `${dspWarmth.value}%`;
  });

  function updateTelemetry(profile) {
    acousticProfile = profile;
    statClassification.textContent = profile.classification;
    statPitch.textContent = `${profile.pitchF0} Hz`;
    statF1.textContent = `${profile.formantF1} Hz`;
    statF2.textContent = `${profile.formantF2} Hz`;
    statBrightness.textContent = `${profile.brightness} %`;

    enrollmentStatus.textContent = `Enrolled: ${profile.classification}`;
    enrollmentStatus.style.color = '#10b981';
    referencePlayerBox.style.display = 'block';
  }

  // Archetype Presets
  document.querySelectorAll('.btn-sample-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-preset');
      const conf = ARCHETYPE_PROFILES[p];
      if (conf) {
        updateTelemetry(conf);
        referenceBuffer = synthesizeArchetypeBuffer(conf);
      }
    });
  });

  // Upload Audio File
  btnUploadFile.addEventListener('click', () => sampleFileInput.click());
  sampleFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    enrollmentStatus.textContent = 'Decoding...';
    try {
      const ctx = getAudioContext();
      const arr = await file.arrayBuffer();
      referenceBuffer = await ctx.decodeAudioData(arr);
      const profile = analyzeAcoustics(referenceBuffer);
      updateTelemetry(profile);
    } catch (err) {
      console.error(err);
      alert('Error analyzing audio file: ' + err.message);
    }
  });

  // Record from Mic (8 seconds)
  btnRecordMic.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      btnRecordMic.disabled = true;
      let countdown = 8;
      btnRecordMic.textContent = `Recording (${countdown}s)...`;
      enrollmentStatus.textContent = 'Listening to Mic...';
      enrollmentStatus.style.color = 'var(--accent)';

      const intv = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          btnRecordMic.textContent = `Recording (${countdown}s)...`;
        } else {
          clearInterval(intv);
        }
      }, 1000);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const arr = await blob.arrayBuffer();
        const ctx = getAudioContext();
        referenceBuffer = await ctx.decodeAudioData(arr);
        const profile = analyzeAcoustics(referenceBuffer);
        updateTelemetry(profile);
        btnRecordMic.disabled = false;
        btnRecordMic.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg> Record from Mic (8s)';
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
      }, 8000);

    } catch (err) {
      console.error(err);
      alert('Microphone error: ' + err.message);
      btnRecordMic.disabled = false;
    }
  });

  // Play Reference Sample
  btnPlayRef.addEventListener('click', () => {
    if (!referenceBuffer) return;
    const ctx = getAudioContext();
    if (referenceSource) {
      try { referenceSource.stop(); } catch (e) {}
    }
    referenceSource = ctx.createBufferSource();
    referenceSource.buffer = referenceBuffer;
    referenceSource.connect(ctx.destination);
    referenceSource.start();
  });

  // Synthesize Cloned Voice
  btnSpeakCloned.addEventListener('click', async () => {
    const text = cloneScript.value.trim();
    if (!text) return;

    stopClonedAudio();

    btnSpeakCloned.disabled = true;
    cloneStatusBadge.textContent = 'Rendering DSP...';
    cloneStatusBadge.style.color = 'var(--accent)';
    if (cloneHint) cloneHint.style.display = 'none';

    try {
      const formantGain = parseFloat(dspFormantGain.value);
      const warmth = parseFloat(dspWarmth.value);
      clonedBuffer = await renderClonedSpeechAudio(text, acousticProfile, formantGain, warmth);

      cloneStatusBadge.textContent = 'Speaking Cloned...';
      cloneStatusBadge.style.color = '#10b981';
      btnStopClone.disabled = false;

      // Play audio buffer
      const ctx = getAudioContext();
      clonedSource = ctx.createBufferSource();
      clonedSource.buffer = clonedBuffer;
      clonedSource.connect(ctx.destination);

      isSynthesizing = true;
      clonedSource.onended = () => {
        isSynthesizing = false;
        cloneStatusBadge.textContent = 'Finished';
        btnStopClone.disabled = true;
        btnSpeakCloned.disabled = false;
      };

      clonedSource.start();

      // Parallel Web Speech API vocal blend for natural phonetics
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.pitch = Math.min(2.0, Math.max(0.6, acousticProfile.pitchF0 / 150));
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
      }

    } catch (err) {
      console.error(err);
      alert('Error synthesizing cloned speech: ' + err.message);
      cloneStatusBadge.textContent = 'Error';
      cloneStatusBadge.style.color = 'var(--error)';
      btnSpeakCloned.disabled = false;
    }
  });

  function stopClonedAudio() {
    if (clonedSource) {
      try { clonedSource.stop(); } catch (e) {}
      clonedSource = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSynthesizing = false;
    btnStopClone.disabled = true;
    btnSpeakCloned.disabled = false;
    cloneStatusBadge.textContent = 'Ready';
  }

  btnStopClone.addEventListener('click', stopClonedAudio);

  // Download Cloned WAV
  btnDownloadClonedWav.addEventListener('click', async () => {
    if (!clonedBuffer) {
      // synthesize if not already rendered
      const text = cloneScript.value.trim();
      if (!text) return;
      btnDownloadClonedWav.textContent = 'Rendering...';
      clonedBuffer = await renderClonedSpeechAudio(text, acousticProfile, parseFloat(dspFormantGain.value), parseFloat(dspWarmth.value));
      btnDownloadClonedWav.textContent = 'Download Cloned WAV';
    }

    const wavBlob = audioBufferToWavBlob(clonedBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-clone-${acousticProfile.classification.toLowerCase().replace(/\s+/g, '-')}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Save Voice Profile
  btnSaveProfile.addEventListener('click', () => {
    localStorage.setItem('allinone_saved_voice_profile', JSON.stringify(acousticProfile));
    const orig = btnSaveProfile.textContent;
    btnSaveProfile.textContent = 'Saved to Storage!';
    setTimeout(() => { btnSaveProfile.textContent = orig; }, 1500);
  });

  // Load saved profile if present
  const saved = localStorage.getItem('allinone_saved_voice_profile');
  if (saved) {
    try {
      const p = JSON.parse(saved);
      updateTelemetry(p);
      referenceBuffer = synthesizeArchetypeBuffer(p);
    } catch (e) {}
  } else {
    // Default to Tenor
    updateTelemetry(ARCHETYPE_PROFILES.tenor);
    referenceBuffer = synthesizeArchetypeBuffer(ARCHETYPE_PROFILES.tenor);
  }
});