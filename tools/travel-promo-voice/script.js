// Travel Promo Voiceover Studio Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const promoScript = document.getElementById('promoScript');
  const vocalTonePreset = document.getElementById('vocalTonePreset');
  const voiceSelect = document.getElementById('voiceSelect');
  const voiceRate = document.getElementById('voiceRate');
  const voiceRateVal = document.getElementById('voiceRateVal');
  const voicePitch = document.getElementById('voicePitch');
  const voicePitchVal = document.getElementById('voicePitchVal');
  const ambienceVolume = document.getElementById('ambienceVolume');
  const ambienceVolumeVal = document.getElementById('ambienceVolumeVal');

  const playPromoBtn = document.getElementById('playPromoBtn');
  const stopPromoBtn = document.getElementById('stopPromoBtn');
  const previewAmbienceBtn = document.getElementById('previewAmbienceBtn');
  const exportWavBtn = document.getElementById('exportWavBtn');

  const recordMicBtn = document.getElementById('recordMicBtn');
  const stopMicBtn = document.getElementById('stopMicBtn');
  const micRecordingStatus = document.getElementById('micRecordingStatus');

  const studioStatus = document.getElementById('studioStatus');
  const playbackTimer = document.getElementById('playbackTimer');
  const canvas = document.getElementById('visualizerCanvas');
  const canvasCtx = canvas ? canvas.getContext('2d') : null;

  const destinationPills = document.querySelectorAll('.preset-pill, .preset-dest');
  const ambienceCards = document.querySelectorAll('.ambience-card');

  // State
  let audioCtx = null;
  let analyserNode = null;
  let activeAmbienceNodes = [];
  let isPlaying = false;
  let isRecordingMic = false;
  let mediaRecorder = null;
  let micStream = null;
  let recordedMicAudioBuffer = null;
  let recordedMicChunks = [];
  let availableVoices = [];
  let selectedAmbience = 'waves';
  let animId = null;

  // Presets
  const presets = {
    maldives: "Escape to turquoise horizons and crystal lagoons. Experience unmatched serenity in your private overwater sanctuary in the Maldives. Book your all-inclusive island getaway today.",
    alps: "Breathe the pristine mountain air. Carve pristine powder beneath majestic peaks, then unwind by the crackling fires of your five-star Alpine chalet. Discover the Swiss Alps this winter.",
    dubai: "Where golden desert dunes meet awe-inspiring futuristic skylines. Indulge in sunset desert safaris, Michelin-starred culinary journeys, and private yacht cruises across Dubai Marina.",
    tokyo: "Step into tomorrow while honoring centuries of ancient tradition. From neon-lit Shibuya crossings to serene Kyoto shrines, experience the ultimate Japanese odyssey.",
    bali: "Reawaken your senses in the lush emerald heart of Bali. Rejuvenate with ancient spiritual spa therapies, sacred temple blessings, and secluded rainforest villas in Ubud.",
    santorini: "Sun-drenched whitewashed cliffs and dazzling sapphire waters. Sail into legendary golden sunsets aboard private catamaran cruises across the Aegean caldera."
  };

  promoScript.value = presets.maldives;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Populate Voices
  function populateVoices() {
    if (!window.speechSynthesis) return;
    availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length === 0) return;

    voiceSelect.innerHTML = '';
    let selectedIdx = 0;
    availableVoices.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${v.name} (${v.lang})`;
      if (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Serena'))) {
        selectedIdx = i;
      }
      voiceSelect.appendChild(opt);
    });
    voiceSelect.selectedIndex = selectedIdx;
  }
  if (window.speechSynthesis) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Destination Pill Click
  destinationPills.forEach(pill => {
    pill.addEventListener('click', () => {
      destinationPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const dest = pill.getAttribute('data-dest');
      if (presets[dest]) {
        promoScript.value = presets[dest];
      }
      // Auto-set matching ambience
      if (dest === 'maldives' || dest === 'santorini') selectAmbience('waves');
      else if (dest === 'alps') selectAmbience('wind');
      else if (dest === 'dubai' || dest === 'bali') selectAmbience('resort');
      else if (dest === 'tokyo') selectAmbience('jet');
    });
  });

  // Ambience Card Click
  function selectAmbience(soundKey) {
    selectedAmbience = soundKey;
    ambienceCards.forEach(c => {
      if (c.getAttribute('data-sound') === soundKey) c.classList.add('selected');
      else c.classList.remove('selected');
    });
  }

  ambienceCards.forEach(card => {
    card.addEventListener('click', () => {
      selectAmbience(card.getAttribute('data-sound'));
    });
  });

  // Sliders
  voiceRate.addEventListener('input', (e) => {
    voiceRateVal.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
  });
  voicePitch.addEventListener('input', (e) => {
    voicePitchVal.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
  });
  ambienceVolume.addEventListener('input', (e) => {
    ambienceVolumeVal.textContent = `${e.target.value}%`;
  });

  // Synthesize Ambience Bed (Web Audio API)
  function createAmbienceBed(ctx, destNode, soundType, volPercent, startTime = 0, duration = 60) {
    if (soundType === 'none' || volPercent <= 0) return [];
    const masterGain = ctx.createGain();
    const vol = (volPercent / 100) * 0.35;
    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(vol, startTime + 1.0);
    masterGain.gain.setValueAtTime(vol, startTime + duration - 1.0);
    masterGain.gain.linearRampToValueAtTime(0, startTime + duration);
    masterGain.connect(destNode);

    const nodes = [masterGain];

    if (soundType === 'waves') {
      // Pink noise + modulated lowpass filter
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.12;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, startTime);

      // LFO for surf waves
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, startTime); // ~8 sec ocean swell
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(320, startTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(masterGain);

      noise.start(startTime);
      lfo.start(startTime);
      noise.stop(startTime + duration);
      lfo.stop(startTime + duration);
      nodes.push(noise, filter, lfo, lfoGain);
    } else if (soundType === 'wind') {
      // Wind sweeping noise
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const out = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        out[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, startTime);
      filter.Q.setValueAtTime(3.0, startTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, startTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(200, startTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(masterGain);

      noise.start(startTime);
      lfo.start(startTime);
      noise.stop(startTime + duration);
      lfo.stop(startTime + duration);
      nodes.push(noise, filter, lfo, lfoGain);
    } else if (soundType === 'jet') {
      // Jet cabin hum: low sine drone + smooth low noise
      const osc1 = ctx.createOscillator();
      osc1.frequency.setValueAtTime(75, startTime);
      const osc2 = ctx.createOscillator();
      osc2.frequency.setValueAtTime(150, startTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.25, startTime);

      osc1.connect(oscGain);
      osc2.connect(oscGain);
      oscGain.connect(masterGain);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
      nodes.push(osc1, osc2, oscGain);
    } else if (soundType === 'resort') {
      // Sunset Chord Pad: D major 9th (D3, A3, F#4, C#5)
      const freqs = [146.83, 220.00, 369.99, 554.37];
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, startTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, startTime);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.08, startTime);

        osc.connect(filter);
        filter.connect(g);
        g.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
        nodes.push(osc, filter, g);
      });
    }

    return nodes;
  }

  // Vocal Processing Filter Chain
  function applyVocalEQ(ctx, inputNode, outputNode, profile) {
    if (profile === 'wanderlust') {
      // Cinematic warm low-end + silky air
      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.value = 140;
      lowShelf.gain.value = 3.5;

      const highShelf = ctx.createBiquadFilter();
      highShelf.type = 'highshelf';
      highShelf.frequency.value = 9000;
      highShelf.gain.value = 3.0;

      inputNode.connect(lowShelf);
      lowShelf.connect(highShelf);
      highShelf.connect(outputNode);
      return;
    } else if (profile === 'adventure') {
      // Punchy mid presence
      const peak = ctx.createBiquadFilter();
      peak.type = 'peaking';
      peak.frequency.value = 2800;
      peak.Q.value = 1.2;
      peak.gain.value = 4.0;

      inputNode.connect(peak);
      peak.connect(outputNode);
      return;
    } else if (profile === 'spa') {
      // Silk lowpass roll-off
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 7500;

      inputNode.connect(lowpass);
      lowpass.connect(outputNode);
      return;
    }
    inputNode.connect(outputNode);
  }

  // Visualizer Loop
  function drawVisualizer() {
    if (!canvas || !canvasCtx) return;
    const width = canvas.width = canvas.clientWidth || 300;
    const height = canvas.height = canvas.clientHeight || 120;

    if (!analyserNode || (!isPlaying && !isRecordingMic)) {
      canvasCtx.fillStyle = '#050508';
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
      canvasCtx.lineWidth = 1.5;
      canvasCtx.beginPath();
      const mid = height / 2;
      for (let x = 0; x < width; x += 3) {
        const y = mid + Math.sin(x * 0.05 + Date.now() * 0.002) * 5;
        if (x === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
      }
      canvasCtx.stroke();
      if (isPlaying || isRecordingMic) {
        animId = requestAnimationFrame(drawVisualizer);
      }
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(data);

    canvasCtx.fillStyle = '#050508';
    canvasCtx.fillRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 2.2;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const h = (data[i] / 255) * (height - 8);
      const hue = 195 + (i / bufferLength) * 45; // Tropical lagoon cyan-blue
      canvasCtx.fillStyle = `hsl(${hue}, 90%, ${45 + (data[i] / 255) * 30}%)`;
      canvasCtx.fillRect(x, height - h, barWidth - 1, h);
      x += barWidth;
    }

    animId = requestAnimationFrame(drawVisualizer);
  }
  drawVisualizer();

  // Test Ambience
  previewAmbienceBtn.addEventListener('click', () => {
    stopAllAudio();
    const ctx = getAudioContext();
    isPlaying = true;
    studioStatus.textContent = `Playing ${selectedAmbience} ambience...`;
    activeAmbienceNodes = createAmbienceBed(ctx, analyserNode, selectedAmbience, parseFloat(ambienceVolume.value), ctx.currentTime, 5.0);
    drawVisualizer();

    setTimeout(() => {
      stopAllAudio();
      studioStatus.textContent = 'Ready to produce';
    }, 5200);
  });

  // Play Promo Audio
  playPromoBtn.addEventListener('click', () => {
    const text = promoScript.value.trim();
    if (!text && !recordedMicAudioBuffer) {
      alert('Please enter promo script text or record with your microphone.');
      return;
    }

    stopAllAudio();
    const ctx = getAudioContext();
    isPlaying = true;
    playPromoBtn.disabled = true;
    stopPromoBtn.disabled = false;
    studioStatus.textContent = 'Broadcasting Travel Commercial...';
    drawVisualizer();

    // Start Ambience bed
    const durationEstimate = Math.max(8.0, text.split(' ').length * 0.45 + 3.0);
    activeAmbienceNodes = createAmbienceBed(ctx, analyserNode, selectedAmbience, parseFloat(ambienceVolume.value), ctx.currentTime, durationEstimate);

    // Play Voice
    if (recordedMicAudioBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = recordedMicAudioBuffer;
      const vBus = ctx.createGain();
      applyVocalEQ(ctx, vBus, analyserNode, vocalTonePreset.value);
      src.connect(vBus);
      src.start(ctx.currentTime + 0.5);
      src.onended = finishPlayback;
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      if (availableVoices.length > 0 && voiceSelect.value !== '') {
        utt.voice = availableVoices[parseInt(voiceSelect.value, 10)];
      }
      utt.rate = parseFloat(voiceRate.value);
      utt.pitch = parseFloat(voicePitch.value);
      utt.onend = finishPlayback;
      utt.onerror = finishPlayback;

      setTimeout(() => {
        if (isPlaying) window.speechSynthesis.speak(utt);
      }, 400);
    }
  });

  function finishPlayback() {
    stopAllAudio();
    studioStatus.textContent = 'Production Complete';
    setTimeout(() => {
      studioStatus.textContent = 'Ready to produce';
    }, 2000);
  }

  function stopAllAudio() {
    isPlaying = false;
    playPromoBtn.disabled = false;
    stopPromoBtn.disabled = true;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    activeAmbienceNodes.forEach(node => {
      try { node.stop(); } catch {}
      try { node.disconnect(); } catch {}
    });
    activeAmbienceNodes = [];
  }

  stopPromoBtn.addEventListener('click', stopAllAudio);

  // Mic Recording
  recordMicBtn.addEventListener('click', async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone not supported in this browser.');
        return;
      }
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedMicChunks = [];
      const ctx = getAudioContext();

      const micSource = ctx.createMediaStreamSource(micStream);
      micSource.connect(analyserNode);

      mediaRecorder = new MediaRecorder(micStream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedMicChunks.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedMicChunks, { type: 'audio/webm' });
        const arrayBuf = await blob.arrayBuffer();
        try {
          recordedMicAudioBuffer = await ctx.decodeAudioData(arrayBuf);
          micRecordingStatus.textContent = `Narration recorded (${recordedMicAudioBuffer.duration.toFixed(1)}s). Ready to blend!`;
          micRecordingStatus.style.color = '#10b981';
        } catch {
          micRecordingStatus.textContent = 'Narration recorded successfully.';
        }
        isRecordingMic = false;
        recordMicBtn.style.display = 'inline-flex';
        stopMicBtn.style.display = 'none';
        stopMicBtn.disabled = true;
        studioStatus.textContent = 'Narration Saved';
      };

      mediaRecorder.start();
      isRecordingMic = true;
      recordMicBtn.style.display = 'none';
      stopMicBtn.style.display = 'inline-flex';
      stopMicBtn.disabled = false;
      studioStatus.textContent = 'Recording Narration...';
      drawVisualizer();
    } catch (err) {
      alert('Could not access microphone: ' + err.message);
    }
  });

  stopMicBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      if (micStream) micStream.getTracks().forEach(t => t.stop());
    }
  });

  // Export Mixed Commercial to WAV
  exportWavBtn.addEventListener('click', async () => {
    studioStatus.textContent = 'Rendering travel commercial audio master...';
    const sampleRate = 44100;
    const dur = recordedMicAudioBuffer ? recordedMicAudioBuffer.duration + 2.0 : 8.0;
    const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offCtx = new OfflineCtxClass(2, Math.ceil(dur * sampleRate), sampleRate);

    // 1. Render Ambience Bed into offline context
    createAmbienceBed(offCtx, offCtx.destination, selectedAmbience, parseFloat(ambienceVolume.value), 0, dur);

    // 2. Render Voiceover if mic recorded
    if (recordedMicAudioBuffer) {
      const src = offCtx.createBufferSource();
      src.buffer = recordedMicAudioBuffer;
      const vBus = offCtx.createGain();
      applyVocalEQ(offCtx, vBus, offCtx.destination, vocalTonePreset.value);
      src.connect(vBus);
      src.start(0.5);
    }

    try {
      const renderedBuffer = await offCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);
      downloadBlob(wavBlob, `travel_promo_${selectedAmbience}_${Date.now()}.wav`);
      studioStatus.textContent = 'WAV Export Ready!';
      setTimeout(() => { studioStatus.textContent = 'Ready to produce'; }, 3000);
    } catch (err) {
      alert('Error rendering audio master: ' + err.message);
    }
  });

  // WAV Helper
  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    function writeString(v, offset, str) {
      for (let i = 0; i < str.length; i++) {
        v.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = buffer.getChannelData(ch)[i];
        const s = Math.max(-1, Math.min(1, sample));
        const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
        view.setInt16(offset, val, true);
        offset += 2;
      }
    }
    return new Blob([view], { type: 'audio/wav' });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
});