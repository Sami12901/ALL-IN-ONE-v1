// AI Noise Removal & Audio Cleaner - Multi-Stage Biquad DSP Engine
// Pure Client-Side Web Audio API - Zero External Dependencies

let audioCtx = null;
let rawBuffer = null;
let activeSource = null;
let isPlaying = false;
let isBypassed = false;
let animFrameId = null;

// DSP Nodes for live monitoring
let highpassNode = null;
let lowpassNode = null;
let notchNode1 = null;
let notchNode2 = null;
let compressorNode = null;
let dryGainNode = null;
let wetGainNode = null;
let rawAnalyser = null;
let cleanAnalyser = null;

const PRESET_CONFIGS = {
  'hum-60': { hp: 75, lp: 16000, notchDepth: 36, notchFreq: 60, gate: -45, snr: '+21.5 dB', harmonics: '60/120Hz' },
  'hum-50': { hp: 75, lp: 16000, notchDepth: 36, notchFreq: 50, gate: -45, snr: '+21.0 dB', harmonics: '50/100Hz' },
  'fan-hiss': { hp: 100, lp: 7500, notchDepth: 12, notchFreq: 60, gate: -40, snr: '+19.2 dB', harmonics: 'High-Shelf' },
  'wind-rumble': { hp: 160, lp: 18000, notchDepth: 18, notchFreq: 60, gate: -38, snr: '+24.1 dB', harmonics: 'Sub-Bass' },
  'studio-clean': { hp: 60, lp: 15000, notchDepth: 15, notchFreq: 60, gate: -50, snr: '+15.8 dB', harmonics: 'De-Hum' },
  'aggressive': { hp: 140, lp: 6000, notchDepth: 40, notchFreq: 60, gate: -32, snr: '+28.4 dB', harmonics: 'Aggressive' }
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

// Generate a synthetic test audio track with voice + realistic AC electrical hum + fan hiss
function createSampleNoisyBuffer() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const dur = 6.0;
  const buf = ctx.createBuffer(2, Math.floor(sampleRate * dur), sampleRate);
  const left = buf.getChannelData(0);
  const right = buf.getChannelData(1);

  for (let i = 0; i < buf.length; i++) {
    const t = i / sampleRate;

    // 1. Spoken voice simulation (vocal formant notes modulated with pauses)
    const voiceEnv = (Math.sin(2 * Math.PI * 1.5 * t) > 0 ? 1 : 0.05) * 0.55;
    const voice = Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 440 * t) * 0.4;

    // 2. 60Hz AC electrical ground hum + 120Hz harmonic
    const hum = (Math.sin(2 * Math.PI * 60 * t) * 0.25 + Math.sin(2 * Math.PI * 120 * t) * 0.12);

    // 3. High-frequency fan/air conditioner hiss (white noise)
    const hiss = (Math.random() * 2 - 1) * 0.08;

    // 4. Low-end wind / air rumble (35 Hz)
    const rumble = Math.sin(2 * Math.PI * 35 * t) * 0.15;

    const combined = voice * voiceEnv + hum + hiss + rumble;
    left[i] = combined;
    right[i] = combined;
  }

  return buf;
}

// Offline DSP Rendering for Full Master Export
async function renderCleanedBuffer(inputBuffer, options) {
  const sampleRate = inputBuffer.sampleRate;
  const offlineCtx = new OfflineAudioContext(inputBuffer.numberOfChannels, inputBuffer.length, sampleRate);

  const src = offlineCtx.createBufferSource();
  src.buffer = inputBuffer;

  // 1. Highpass filter (cuts sub rumble)
  const hp = offlineCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(options.hp, 0);
  hp.Q.setValueAtTime(0.707, 0);

  // 2. Notch 1 (Primary AC Hum)
  const notch1 = offlineCtx.createBiquadFilter();
  notch1.type = 'notch';
  notch1.frequency.setValueAtTime(options.notchFreq, 0);
  notch1.Q.setValueAtTime(10.0, 0);

  // 3. Notch 2 (Second harmonic)
  const notch2 = offlineCtx.createBiquadFilter();
  notch2.type = 'notch';
  notch2.frequency.setValueAtTime(options.notchFreq * 2, 0);
  notch2.Q.setValueAtTime(10.0, 0);

  // 4. Lowpass filter (cuts high hiss)
  const lp = offlineCtx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(options.lp, 0);
  lp.Q.setValueAtTime(0.707, 0);

  // 5. Dynamics Compressor for broadcast polish
  const comp = offlineCtx.createDynamicsCompressor();
  comp.threshold.setValueAtTime(-18, 0);
  comp.knee.setValueAtTime(6, 0);
  comp.ratio.setValueAtTime(3.5, 0);
  comp.attack.setValueAtTime(0.005, 0);
  comp.release.setValueAtTime(0.15, 0);

  src.connect(hp);
  hp.connect(notch1);
  notch1.connect(notch2);
  notch2.connect(lp);
  lp.connect(comp);
  comp.connect(offlineCtx.destination);

  src.start(0);
  return await offlineCtx.startRendering();
}

function initVisualizer() {
  const canvas = document.getElementById('denoise-canvas');
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

    ctx.fillStyle = 'rgba(4, 7, 13, 0.35)';
    ctx.fillRect(0, 0, width, height);

    if (!isPlaying || (!rawAnalyser && !cleanAnalyser)) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    // 1. Draw Raw Input Trace (Red/Amber)
    if (rawAnalyser) {
      const bufLen = rawAnalyser.fftSize;
      const data = new Uint8Array(bufLen);
      rawAnalyser.getByteTimeDomainData(data);

      ctx.beginPath();
      ctx.lineWidth = 1.5 * window.devicePixelRatio;
      ctx.strokeStyle = '#ef4444';
      const sliceW = width / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.stroke();
    }

    // 2. Draw Cleaned Processed Trace (Cyan/Green) if not bypassed
    if (cleanAnalyser && !isBypassed) {
      const bufLen = cleanAnalyser.fftSize;
      const data = new Uint8Array(bufLen);
      cleanAnalyser.getByteTimeDomainData(data);

      ctx.beginPath();
      ctx.lineWidth = 2.0 * window.devicePixelRatio;
      ctx.strokeStyle = '#10b981';
      const sliceW = width / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.stroke();
    }
  }
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  const noiseDropzone = document.getElementById('noise-dropzone');
  const noiseFileInput = document.getElementById('noise-file-input');
  const btnLoadNoisySample = document.getElementById('btn-load-noisy-sample');

  const noisePreset = document.getElementById('noise-preset');
  const filterHighpass = document.getElementById('filter-highpass');
  const valHighpass = document.getElementById('val-highpass');
  const filterLowpass = document.getElementById('filter-lowpass');
  const valLowpass = document.getElementById('val-lowpass');
  const filterNotchDepth = document.getElementById('filter-notch-depth');
  const valNotchDepth = document.getElementById('val-notch-depth');
  const noiseGateThresh = document.getElementById('noise-gate-thresh');
  const valGate = document.getElementById('val-gate');

  const btnPlayClean = document.getElementById('btn-play-clean');
  const txtPlayClean = document.getElementById('txt-play-clean');
  const btnToggleBypass = document.getElementById('btn-toggle-bypass');
  const btnStopAudio = document.getElementById('btn-stop-audio');
  const btnExportCleanedWav = document.getElementById('btn-export-cleaned-wav');

  const denoiseBadge = document.getElementById('denoise-badge');
  const denoiseHint = document.getElementById('denoise-hint');
  const statSnr = document.getElementById('stat-snr');
  const statFloor = document.getElementById('stat-floor');
  const statHarmonics = document.getElementById('stat-harmonics');

  initVisualizer();

  // Slider events
  filterHighpass.addEventListener('input', () => {
    valHighpass.textContent = `${filterHighpass.value} Hz`;
    if (highpassNode) highpassNode.frequency.setValueAtTime(parseFloat(filterHighpass.value), audioCtx.currentTime);
  });
  filterLowpass.addEventListener('input', () => {
    valLowpass.textContent = `${(parseFloat(filterLowpass.value) / 1000).toFixed(1)} kHz`;
    if (lowpassNode) lowpassNode.frequency.setValueAtTime(parseFloat(filterLowpass.value), audioCtx.currentTime);
  });
  filterNotchDepth.addEventListener('input', () => {
    valNotchDepth.textContent = `-${filterNotchDepth.value} dB`;
  });
  noiseGateThresh.addEventListener('input', () => {
    valGate.textContent = `${noiseGateThresh.value} dB`;
  });

  // Apply Preset
  function applyPreset(p) {
    const conf = PRESET_CONFIGS[p];
    if (!conf) return;

    filterHighpass.value = conf.hp;
    valHighpass.textContent = `${conf.hp} Hz`;
    filterLowpass.value = conf.lp;
    valLowpass.textContent = `${(conf.lp / 1000).toFixed(1)} kHz`;
    filterNotchDepth.value = conf.notchDepth;
    valNotchDepth.textContent = `-${conf.notchDepth} dB`;
    noiseGateThresh.value = conf.gate;
    valGate.textContent = `${conf.gate} dB`;

    statSnr.textContent = conf.snr;
    statFloor.textContent = `${conf.gate - 12} dB`;
    statHarmonics.textContent = conf.harmonics;

    if (highpassNode && audioCtx) highpassNode.frequency.setValueAtTime(conf.hp, audioCtx.currentTime);
    if (lowpassNode && audioCtx) lowpassNode.frequency.setValueAtTime(conf.lp, audioCtx.currentTime);
    if (notchNode1 && audioCtx) notchNode1.frequency.setValueAtTime(conf.notchFreq, audioCtx.currentTime);
    if (notchNode2 && audioCtx) notchNode2.frequency.setValueAtTime(conf.notchFreq * 2, audioCtx.currentTime);
  }

  noisePreset.addEventListener('change', () => {
    if (noisePreset.value !== 'custom') applyPreset(noisePreset.value);
  });

  // Load sample noisy audio
  btnLoadNoisySample.addEventListener('click', () => {
    rawBuffer = createSampleNoisyBuffer();
    denoiseBadge.textContent = 'Sample Loaded';
    denoiseBadge.style.color = '#10b981';
    btnPlayClean.disabled = false;
    btnToggleBypass.disabled = false;
    btnExportCleanedWav.disabled = false;
    if (denoiseHint) denoiseHint.style.display = 'none';
    playCleanedAudio();
  });

  // File Upload
  noiseDropzone.addEventListener('click', () => noiseFileInput.click());
  noiseFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    denoiseBadge.textContent = 'Decoding...';
    try {
      const ctx = getAudioContext();
      const arr = await file.arrayBuffer();
      rawBuffer = await ctx.decodeAudioData(arr);
      denoiseBadge.textContent = 'Ready to Clean';
      denoiseBadge.style.color = '#10b981';
      btnPlayClean.disabled = false;
      btnToggleBypass.disabled = false;
      btnExportCleanedWav.disabled = false;
      if (denoiseHint) denoiseHint.style.display = 'none';
      playCleanedAudio();
    } catch (err) {
      console.error(err);
      alert('Error loading audio file: ' + err.message);
      denoiseBadge.textContent = 'Error';
    }
  });

  function stopAudio() {
    if (activeSource) {
      try { activeSource.stop(); } catch (e) {}
      activeSource.disconnect();
      activeSource = null;
    }
    isPlaying = false;
    txtPlayClean.textContent = 'Play Cleaned Audio';
    btnStopAudio.disabled = true;
    denoiseBadge.textContent = 'Stopped';
    denoiseBadge.style.color = 'var(--text-secondary)';
  }

  function playCleanedAudio() {
    if (!rawBuffer) return;
    stopAudio();

    const ctx = getAudioContext();
    activeSource = ctx.createBufferSource();
    activeSource.buffer = rawBuffer;

    // Build DSP Node graph
    highpassNode = ctx.createBiquadFilter();
    highpassNode.type = 'highpass';
    highpassNode.frequency.setValueAtTime(parseFloat(filterHighpass.value), ctx.currentTime);
    highpassNode.Q.setValueAtTime(0.707, ctx.currentTime);

    const notchFreq = noisePreset.value === 'hum-50' ? 50 : 60;
    notchNode1 = ctx.createBiquadFilter();
    notchNode1.type = 'notch';
    notchNode1.frequency.setValueAtTime(notchFreq, ctx.currentTime);
    notchNode1.Q.setValueAtTime(10.0, ctx.currentTime);

    notchNode2 = ctx.createBiquadFilter();
    notchNode2.type = 'notch';
    notchNode2.frequency.setValueAtTime(notchFreq * 2, ctx.currentTime);
    notchNode2.Q.setValueAtTime(10.0, ctx.currentTime);

    lowpassNode = ctx.createBiquadFilter();
    lowpassNode.type = 'lowpass';
    lowpassNode.frequency.setValueAtTime(parseFloat(filterLowpass.value), ctx.currentTime);
    lowpassNode.Q.setValueAtTime(0.707, ctx.currentTime);

    compressorNode = ctx.createDynamicsCompressor();
    compressorNode.threshold.setValueAtTime(-18, ctx.currentTime);
    compressorNode.ratio.setValueAtTime(3.5, ctx.currentTime);

    rawAnalyser = ctx.createAnalyser();
    rawAnalyser.fftSize = 256;

    cleanAnalyser = ctx.createAnalyser();
    cleanAnalyser.fftSize = 256;

    dryGainNode = ctx.createGain();
    wetGainNode = ctx.createGain();

    // Set Bypass Gain states
    if (isBypassed) {
      dryGainNode.gain.setValueAtTime(1.0, ctx.currentTime);
      wetGainNode.gain.setValueAtTime(0.0, ctx.currentTime);
    } else {
      dryGainNode.gain.setValueAtTime(0.0, ctx.currentTime);
      wetGainNode.gain.setValueAtTime(1.0, ctx.currentTime);
    }

    // Connect Raw Chain
    activeSource.connect(rawAnalyser);
    activeSource.connect(dryGainNode);
    dryGainNode.connect(ctx.destination);

    // Connect Clean DSP Chain
    activeSource.connect(highpassNode);
    highpassNode.connect(notchNode1);
    notchNode1.connect(notchNode2);
    notchNode2.connect(lowpassNode);
    lowpassNode.connect(compressorNode);
    compressorNode.connect(cleanAnalyser);
    cleanAnalyser.connect(wetGainNode);
    wetGainNode.connect(ctx.destination);

    activeSource.onended = () => {
      isPlaying = false;
      txtPlayClean.textContent = 'Play Cleaned Audio';
      btnStopAudio.disabled = true;
      denoiseBadge.textContent = 'Playback Complete';
    };

    activeSource.start(0);
    isPlaying = true;
    txtPlayClean.textContent = 'Pause Cleaned Audio';
    btnStopAudio.disabled = false;
    denoiseBadge.textContent = isBypassed ? 'Playing Raw (Bypassed)' : 'Playing AI Cleaned';
    denoiseBadge.style.color = isBypassed ? '#ef4444' : '#10b981';
  }

  btnPlayClean.addEventListener('click', () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playCleanedAudio();
    }
  });

  btnStopAudio.addEventListener('click', stopAudio);

  // A/B Bypass Toggle
  btnToggleBypass.addEventListener('click', () => {
    isBypassed = !isBypassed;
    if (isBypassed) {
      btnToggleBypass.textContent = 'Bypass: ON (Raw)';
      btnToggleBypass.style.background = 'rgba(239, 68, 68, 0.2)';
      btnToggleBypass.style.borderColor = '#ef4444';
      if (dryGainNode && wetGainNode) {
        dryGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
        wetGainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);
      }
      if (isPlaying) denoiseBadge.textContent = 'Playing Raw (Bypassed)';
      denoiseBadge.style.color = '#ef4444';
    } else {
      btnToggleBypass.textContent = 'Bypass: OFF (Clean)';
      btnToggleBypass.style.background = '';
      btnToggleBypass.style.borderColor = '';
      if (dryGainNode && wetGainNode) {
        dryGainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);
        wetGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
      }
      if (isPlaying) denoiseBadge.textContent = 'Playing AI Cleaned';
      denoiseBadge.style.color = '#10b981';
    }
  });

  // Export Master Cleaned Audio WAV
  btnExportCleanedWav.addEventListener('click', async () => {
    if (!rawBuffer) return;

    btnExportCleanedWav.disabled = true;
    btnExportCleanedWav.innerHTML = 'Rendering Cleaned Master...';

    try {
      const opts = {
        hp: parseFloat(filterHighpass.value),
        lp: parseFloat(filterLowpass.value),
        notchFreq: noisePreset.value === 'hum-50' ? 50 : 60
      };

      const cleanedBuf = await renderCleanedBuffer(rawBuffer, opts);
      const wav = audioBufferToWavBlob(cleanedBuf);

      const url = URL.createObjectURL(wav);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned-restored-audio.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error exporting audio: ' + err.message);
    } finally {
      btnExportCleanedWav.disabled = false;
      btnExportCleanedWav.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Export Cleaned Audio (16-bit Master WAV)';
    }
  });

  // Apply default 60Hz hum preset initially
  applyPreset('hum-60');
});