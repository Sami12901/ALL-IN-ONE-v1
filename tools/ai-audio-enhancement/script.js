// AI Audio Enhancement & Mastering Studio - Engine

function bufferToWave(abuffer, len) {
  const numOfChan = abuffer.numberOfChannels;
  const length = (len || abuffer.length) * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels = [], i, sample, offset = 0, pos = 0;

  function writeString(s) { for (let j = 0; j < s.length; j++) out.setUint8(pos++, s.charCodeAt(j)); }
  function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
  function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

  writeString('RIFF');
  setUint32(length - 8);
  writeString('WAVE');
  writeString('fmt ');
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  writeString('data');
  setUint32(length - pos - 4);

  for (i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

  while (offset < (len || abuffer.length)) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  return new Blob([out.buffer], { type: 'audio/wav' });
}

const PROFILES = {
  podcast: { low: 4, mud: -3, presence: 5, deesser: -4, air: 6, comp: 50, gate: 60 },
  crystal_voice: { low: 1, mud: -5, presence: 7, deesser: -6, air: 5, comp: 65, gate: 75 },
  broadcast: { low: 6, mud: -2, presence: 4, deesser: -3, air: 4, comp: 80, gate: 50 },
  vintage: { low: 5, mud: 1, presence: 2, deesser: -2, air: -2, comp: 40, gate: 40 },
  asmr: { low: 2, mud: -4, presence: 6, deesser: -5, air: 9, comp: 30, gate: 70 }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let audioBuffer = null;
  let sourceNode = null;
  let analyserNode = null;
  let isPlaying = false;
  let isEnhancedMode = true; // A/B comparison state

  // Filter chain nodes
  let filterLowCut = null;
  let filterLow = null;
  let filterMud = null;
  let filterPresence = null;
  let filterDeEsser = null;
  let filterAir = null;
  let compressor = null;
  let makeupGain = null;
  let dryGain = null;
  let wetGain = null;
  let animId = null;

  // DOM
  const btnCompareOriginal = document.getElementById('btnCompareOriginal');
  const btnCompareEnhanced = document.getElementById('btnCompareEnhanced');
  const audioEngineMode = document.getElementById('audioEngineMode');
  const fftCanvas = document.getElementById('fftCanvas');
  const canvasCtx = fftCanvas.getContext('2d');

  const btnPlay = document.getElementById('btnPlay');
  const btnStop = document.getElementById('btnStop');
  const btnLoadSample = document.getElementById('btnLoadSample');
  const audioFileInput = document.getElementById('audioFileInput');
  const btnDownloadEnhancedWav = document.getElementById('btnDownloadEnhancedWav');

  const eqLow = document.getElementById('eqLow');
  const eqMud = document.getElementById('eqMud');
  const eqPresence = document.getElementById('eqPresence');
  const eqDeEsser = document.getElementById('eqDeEsser');
  const eqAir = document.getElementById('eqAir');
  const eqLowDisp = document.getElementById('eqLowDisp');
  const eqMudDisp = document.getElementById('eqMudDisp');
  const eqPresenceDisp = document.getElementById('eqPresenceDisp');
  const eqDeEsserDisp = document.getElementById('eqDeEsserDisp');
  const eqAirDisp = document.getElementById('eqAirDisp');

  const noiseGate = document.getElementById('noiseGate');
  const compLevel = document.getElementById('compLevel');
  const gateDisp = document.getElementById('gateDisp');
  const compDisp = document.getElementById('compDisp');

  function initAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
      setupFilterChain();
      startSpectrumVisualizer();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function setupFilterChain() {
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 512;

    // Highpass Low Cut (Rumble remover)
    filterLowCut = audioCtx.createBiquadFilter();
    filterLowCut.type = 'highpass';
    filterLowCut.frequency.value = 80;

    // 1. Bass Warmth (120 Hz)
    filterLow = audioCtx.createBiquadFilter();
    filterLow.type = 'peaking';
    filterLow.frequency.value = 120;
    filterLow.Q.value = 1.0;
    filterLow.gain.value = parseFloat(eqLow.value);

    // 2. Mud Cut (350 Hz)
    filterMud = audioCtx.createBiquadFilter();
    filterMud.type = 'peaking';
    filterMud.frequency.value = 350;
    filterMud.Q.value = 1.4;
    filterMud.gain.value = parseFloat(eqMud.value);

    // 3. Presence (2.5 kHz)
    filterPresence = audioCtx.createBiquadFilter();
    filterPresence.type = 'peaking';
    filterPresence.frequency.value = 2500;
    filterPresence.Q.value = 1.0;
    filterPresence.gain.value = parseFloat(eqPresence.value);

    // 4. De-Esser (6.5 kHz)
    filterDeEsser = audioCtx.createBiquadFilter();
    filterDeEsser.type = 'peaking';
    filterDeEsser.frequency.value = 6500;
    filterDeEsser.Q.value = 2.0;
    filterDeEsser.gain.value = parseFloat(eqDeEsser.value);

    // 5. Silk Air (12 kHz)
    filterAir = audioCtx.createBiquadFilter();
    filterAir.type = 'highshelf';
    filterAir.frequency.value = 12000;
    filterAir.gain.value = parseFloat(eqAir.value);

    // Dynamics Compressor
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
    compressor.knee.setValueAtTime(10, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(4.0, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

    makeupGain = audioCtx.createGain();
    makeupGain.gain.value = 1.25;

    // A/B Routing gains
    dryGain = audioCtx.createGain(); // RAW
    wetGain = audioCtx.createGain(); // ENHANCED

    // Chain: Input -> Wet -> LowCut -> Low -> Mud -> Presence -> DeEsser -> Air -> Comp -> Makeup -> Analyser
    filterLowCut.connect(filterLow);
    filterLow.connect(filterMud);
    filterMud.connect(filterPresence);
    filterPresence.connect(filterDeEsser);
    filterDeEsser.connect(filterAir);
    filterAir.connect(compressor);
    compressor.connect(makeupGain);
    makeupGain.connect(analyserNode);

    // Dry directly to analyser
    dryGain.connect(analyserNode);

    // Analyser to output
    analyserNode.connect(audioCtx.destination);

    updateABState();
  }

  function updateABState() {
    if (!dryGain || !wetGain) return;
    if (isEnhancedMode) {
      dryGain.gain.setValueAtTime(0, audioCtx.currentTime);
      wetGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
      audioEngineMode.textContent = 'DSP ACTIVE: ENHANCED PIPELINE (5-BAND EQ + COMPRESSOR)';
      audioEngineMode.style.color = '#00e676';
    } else {
      dryGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
      wetGain.gain.setValueAtTime(0, audioCtx.currentTime);
      audioEngineMode.textContent = 'BYPASS ACTIVE: RAW UNPROCESSED AUDIO';
      audioEngineMode.style.color = '#ff9800';
    }
  }

  btnCompareOriginal.addEventListener('click', () => {
    isEnhancedMode = false;
    btnCompareOriginal.classList.add('active');
    btnCompareEnhanced.classList.remove('active');
    updateABState();
  });

  btnCompareEnhanced.addEventListener('click', () => {
    isEnhancedMode = true;
    btnCompareEnhanced.classList.add('active');
    btnCompareOriginal.classList.remove('active');
    updateABState();
  });

  // Slider Updates
  function updateEq() {
    if (!filterLow) return;
    filterLow.gain.setValueAtTime(parseFloat(eqLow.value), audioCtx.currentTime);
    filterMud.gain.setValueAtTime(parseFloat(eqMud.value), audioCtx.currentTime);
    filterPresence.gain.setValueAtTime(parseFloat(eqPresence.value), audioCtx.currentTime);
    filterDeEsser.gain.setValueAtTime(parseFloat(eqDeEsser.value), audioCtx.currentTime);
    filterAir.gain.setValueAtTime(parseFloat(eqAir.value), audioCtx.currentTime);

    eqLowDisp.textContent = `${eqLow.value > 0 ? '+' : ''}${eqLow.value} dB`;
    eqMudDisp.textContent = `${eqMud.value > 0 ? '+' : ''}${eqMud.value} dB`;
    eqPresenceDisp.textContent = `${eqPresence.value > 0 ? '+' : ''}${eqPresence.value} dB`;
    eqDeEsserDisp.textContent = `${eqDeEsser.value > 0 ? '+' : ''}${eqDeEsser.value} dB`;
    eqAirDisp.textContent = `${eqAir.value > 0 ? '+' : ''}${eqAir.value} dB`;
  }

  [eqLow, eqMud, eqPresence, eqDeEsser, eqAir].forEach(el => el.addEventListener('input', updateEq));

  noiseGate.addEventListener('input', () => {
    gateDisp.textContent = `${noiseGate.value}%`;
    if (filterLowCut && audioCtx) {
      filterLowCut.frequency.setValueAtTime(60 + (noiseGate.value * 0.8), audioCtx.currentTime);
    }
  });

  compLevel.addEventListener('input', () => {
    compDisp.textContent = `${compLevel.value}%`;
    if (compressor && audioCtx) {
      const ratio = 2.0 + (compLevel.value / 100) * 8.0;
      compressor.ratio.setValueAtTime(ratio, audioCtx.currentTime);
    }
  });

  // Profile presets
  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const p = PROFILES[btn.dataset.profile];
      if (!p) return;
      eqLow.value = p.low;
      eqMud.value = p.mud;
      eqPresence.value = p.presence;
      eqDeEsser.value = p.deesser;
      eqAir.value = p.air;
      compLevel.value = p.comp;
      noiseGate.value = p.gate;
      gateDisp.textContent = `${p.gate}%`;
      compDisp.textContent = `${p.comp}%`;
      updateEq();
    });
  });

  // Generate Sample Audio Clip (Speech with room hiss)
  function createSampleAudio() {
    initAudioContext();
    const sampleRate = audioCtx.sampleRate;
    const duration = 6.0;
    const buffer = audioCtx.createBuffer(2, sampleRate * duration, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Synthesize human speech voice harmonics (formants) + room noise
    for (let i = 0; i < sampleRate * duration; i++) {
      const t = i / sampleRate;
      // Fundamental vocal pitch ~130Hz modulated
      const f0 = 130 + Math.sin(t * 4) * 8;
      // Speech modulation envelope
      const env = Math.max(0, Math.sin(t * 3.14)) * 0.4;
      const voice = (Math.sin(2 * Math.PI * f0 * t) + 0.5 * Math.sin(2 * Math.PI * f0 * 2.1 * t) + 0.3 * Math.sin(2 * Math.PI * 1800 * t)) * env;
      // Room background hiss / fan hum
      const hiss = (Math.random() * 2 - 1) * 0.04;
      const sample = voice + hiss;
      left[i] = sample;
      right[i] = sample;
    }
    audioBuffer = buffer;
    alert('Loaded 6-second test voice audio with ambient room hiss. Click "Play Audio" to hear the live DSP enhancement!');
  }

  btnLoadSample.addEventListener('click', createSampleAudio);

  // File Upload
  audioFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    initAudioContext();
    try {
      const arrayBuf = await file.arrayBuffer();
      audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
      alert(`Loaded "${file.name}" (${audioBuffer.duration.toFixed(1)}s, ${audioBuffer.numberOfChannels}ch). Ready to play & master!`);
    } catch (err) {
      alert('Error decoding audio file: ' + err.message);
    }
  });

  // Playback Control
  function playAudio() {
    if (!audioBuffer) {
      createSampleAudio();
    }
    stopAudio();
    initAudioContext();

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;

    // Route to Dry and Wet
    sourceNode.connect(dryGain);
    sourceNode.connect(filterLowCut);

    sourceNode.start();
    isPlaying = true;
  }

  function stopAudio() {
    if (sourceNode) {
      try { sourceNode.stop(); sourceNode.disconnect(); } catch(e){}
      sourceNode = null;
    }
    isPlaying = false;
  }

  btnPlay.addEventListener('click', playAudio);
  btnStop.addEventListener('click', stopAudio);

  // Real-Time FFT Spectrum Visualizer
  function startSpectrumVisualizer() {
    if (!analyserNode || !fftCanvas) return;
    const bufLen = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufLen);

    function render() {
      animId = requestAnimationFrame(render);
      analyserNode.getByteFrequencyData(dataArray);

      const w = fftCanvas.width = fftCanvas.clientWidth || 300;
      const h = fftCanvas.height = fftCanvas.clientHeight || 120;

      canvasCtx.fillStyle = '#030509';
      canvasCtx.fillRect(0, 0, w, h);

      const barWidth = (w / bufLen) * 2.5;
      let x = 0;

      for (let i = 0; i < bufLen; i++) {
        const val = dataArray[i];
        const barHeight = (val / 255) * h * 0.9;

        const color = isEnhancedMode ? `hsl(${170 + (i/bufLen)*80}, 100%, 50%)` : `hsl(${35 + (i/bufLen)*20}, 100%, 50%)`;
        canvasCtx.fillStyle = val > 5 ? color : 'rgba(255, 255, 255, 0.05)';
        canvasCtx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
        x += barWidth;
        if (x > w) break;
      }
    }
    render();
  }

  // Download Enhanced Audio as WAV
  btnDownloadEnhancedWav.addEventListener('click', async () => {
    if (!audioBuffer) {
      alert('Please load or upload an audio file first.');
      return;
    }
    btnDownloadEnhancedWav.disabled = true;
    btnDownloadEnhancedWav.innerHTML = '<span>Rendering Enhanced WAV...</span>';

    try {
      const sampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;
      const numChannels = audioBuffer.numberOfChannels;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(numChannels, sampleRate * duration, sampleRate);

      const offSource = offlineCtx.createBufferSource();
      offSource.buffer = audioBuffer;

      // Filter chain offline
      const offLowCut = offlineCtx.createBiquadFilter();
      offLowCut.type = 'highpass';
      offLowCut.frequency.value = 60 + (noiseGate.value * 0.8);

      const offLow = offlineCtx.createBiquadFilter();
      offLow.type = 'peaking';
      offLow.frequency.value = 120;
      offLow.gain.value = parseFloat(eqLow.value);

      const offMud = offlineCtx.createBiquadFilter();
      offMud.type = 'peaking';
      offMud.frequency.value = 350;
      offMud.gain.value = parseFloat(eqMud.value);

      const offPresence = offlineCtx.createBiquadFilter();
      offPresence.type = 'peaking';
      offPresence.frequency.value = 2500;
      offPresence.gain.value = parseFloat(eqPresence.value);

      const offDeEsser = offlineCtx.createBiquadFilter();
      offDeEsser.type = 'peaking';
      offDeEsser.frequency.value = 6500;
      offDeEsser.gain.value = parseFloat(eqDeEsser.value);

      const offAir = offlineCtx.createBiquadFilter();
      offAir.type = 'highshelf';
      offAir.frequency.value = 12000;
      offAir.gain.value = parseFloat(eqAir.value);

      const offComp = offlineCtx.createDynamicsCompressor();
      offComp.threshold.value = -24;
      offComp.ratio.value = 2.0 + (compLevel.value / 100) * 8.0;

      const offMakeup = offlineCtx.createGain();
      offMakeup.gain.value = 1.3;

      offSource.connect(offLowCut);
      offLowCut.connect(offLow);
      offLow.connect(offMud);
      offMud.connect(offPresence);
      offPresence.connect(offDeEsser);
      offDeEsser.connect(offAir);
      offAir.connect(offComp);
      offComp.connect(offMakeup);
      offMakeup.connect(offlineCtx.destination);

      offSource.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      const blob = bufferToWave(renderedBuffer);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai_enhanced_mastered_audio.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error rendering WAV: ' + err.message);
    } finally {
      btnDownloadEnhancedWav.disabled = false;
      btnDownloadEnhancedWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>
        <span>Download Enhanced WAV</span>
      `;
    }
  });

  // Init
  initAudioContext();
});