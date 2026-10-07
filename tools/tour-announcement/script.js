// Tour Announcement Studio Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const tourScript = document.getElementById('tourScript');
  const environmentFilter = document.getElementById('environmentFilter');
  const voiceSelect = document.getElementById('voiceSelect');
  const voiceRate = document.getElementById('voiceRate');
  const voiceRateVal = document.getElementById('voiceRateVal');
  const voicePitch = document.getElementById('voicePitch');
  const voicePitchVal = document.getElementById('voicePitchVal');

  const playTourBtn = document.getElementById('playTourBtn');
  const stopTourBtn = document.getElementById('stopTourBtn');
  const previewChimeBtn = document.getElementById('previewChimeBtn');
  const exportWavBtn = document.getElementById('exportWavBtn');

  const recordMicBtn = document.getElementById('recordMicBtn');
  const stopMicBtn = document.getElementById('stopMicBtn');
  const micRecordingStatus = document.getElementById('micRecordingStatus');

  const studioStatus = document.getElementById('studioStatus');
  const playbackTimer = document.getElementById('playbackTimer');
  const canvas = document.getElementById('visualizerCanvas');
  const canvasCtx = canvas ? canvas.getContext('2d') : null;

  const presetPills = document.querySelectorAll('.preset-pill');
  const chimeCards = document.querySelectorAll('.chime-card');

  // State
  let audioCtx = null;
  let analyserNode = null;
  let selectedChime = 'bus_horn';
  let isPlaying = false;
  let isRecordingMic = false;
  let mediaRecorder = null;
  let micStream = null;
  let recordedMicChunks = [];
  let recordedMicAudioBuffer = null;
  let availableVoices = [];
  let animId = null;

  // Presets
  const presets = {
    bus: "Welcome aboard our panoramic city tour! On your right, you can see the 14th-century royal palace and clock tower. Please remain seated while the vehicle is in motion.",
    cruise: "Ladies and gentlemen, on our port side, we are now approaching the iconic suspension bridge, constructed in 1894. Have your cameras ready for spectacular panoramic views.",
    museum: "Welcome to Gallery Four. Before you stands the masterwork of the Renaissance collection, painted in 1504. Please observe flash photography restrictions and maintain low voices.",
    cathedral: "We are now entering the grand cathedral sanctuary. We kindly ask all tour members to maintain silence, turn mobile phones to silent mode, and respect worshippers in prayer.",
    cablecar: "Welcome to the peak express cable car. We are currently ascending to an elevation of three thousand meters. The observation deck and summit cafe are located on Level Two.",
    rest: "Attention tour group members. We have arrived at our scenic rest stop. You have 15 minutes for refreshments and photography. The coach departs promptly at 11:30 AM."
  };

  tourScript.value = presets.bus;

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
      if (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Samantha') || v.name.includes('Oliver'))) {
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

  // Preset Pills
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const key = pill.getAttribute('data-preset');
      if (presets[key]) {
        tourScript.value = presets[key];
      }
      if (key === 'bus' || key === 'rest') {
        selectChime('bus_horn');
        environmentFilter.value = 'bus_pa';
      } else if (key === 'museum') {
        selectChime('museum_bell');
        environmentFilter.value = 'hall';
      } else if (key === 'cruise') {
        selectChime('arpeggio');
        environmentFilter.value = 'boat';
      } else if (key === 'cathedral') {
        selectChime('museum_bell');
        environmentFilter.value = 'hall';
      } else if (key === 'cablecar') {
        selectChime('whistle');
        environmentFilter.value = 'clean';
      }
    });
  });

  function selectChime(key) {
    selectedChime = key;
    chimeCards.forEach(c => {
      if (c.getAttribute('data-chime') === key) c.classList.add('selected');
      else c.classList.remove('selected');
    });
  }

  chimeCards.forEach(card => {
    card.addEventListener('click', () => {
      selectChime(card.getAttribute('data-chime'));
    });
  });

  voiceRate.addEventListener('input', (e) => {
    voiceRateVal.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
  });
  voicePitch.addEventListener('input', (e) => {
    voicePitchVal.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
  });

  // Synthesize Tour Chimes
  function playTourChime(ctx, outputNode, chimeType, startTime = 0) {
    if (chimeType === 'none') return 0.1;
    const t = startTime || ctx.currentTime;
    let dur = 1.2;

    if (chimeType === 'bus_horn') {
      // Vintage Double Coach Horn: 330Hz + 440Hz dual staccato burst
      [0, 0.22].forEach(offset => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(330, t + offset);
        osc2.frequency.setValueAtTime(440, t + offset);

        gain.gain.setValueAtTime(0, t + offset);
        gain.gain.linearRampToValueAtTime(0.3, t + offset + 0.02);
        gain.gain.setValueAtTime(0.28, t + offset + 0.12);
        gain.gain.linearRampToValueAtTime(0.001, t + offset + 0.16);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(outputNode);

        osc1.start(t + offset);
        osc2.start(t + offset);
        osc1.stop(t + offset + 0.18);
        osc2.stop(t + offset + 0.18);
      });
      dur = 0.6;
    } else if (chimeType === 'museum_bell') {
      // Soft crystal bell: 659.25Hz (E5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(t);
      osc.stop(t + 1.25);
      dur = 1.3;
    } else if (chimeType === 'arpeggio') {
      // Rising triad: C5, E5, G5
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + i * 0.16);
        gain.gain.setValueAtTime(0, t + i * 0.16);
        gain.gain.linearRampToValueAtTime(0.35, t + i * 0.16 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.16 + 0.5);
        osc.connect(gain);
        gain.connect(outputNode);
        osc.start(t + i * 0.16);
        osc.stop(t + i * 0.16 + 0.52);
      });
      dur = 1.0;
    } else if (chimeType === 'whistle') {
      // High guide ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(1760, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(t);
      osc.stop(t + 0.42);
      dur = 0.6;
    }
    return dur;
  }

  // Environment Filter Chain
  function applyEnvironmentFilter(ctx, inputNode, outputNode, env) {
    if (env === 'bus_pa') {
      // Intercom Bandpass 500Hz-3.5kHz with drive
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1600;
      bandpass.Q.value = 1.0;

      const drive = ctx.createGain();
      drive.gain.value = 1.3;

      inputNode.connect(bandpass);
      bandpass.connect(drive);
      drive.connect(outputNode);
      return;
    } else if (env === 'boat') {
      // Open air boat + subtle reflection
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 250;

      const delay = ctx.createDelay();
      delay.delayTime.value = 0.06;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.18;

      inputNode.connect(highpass);
      highpass.connect(outputNode);
      highpass.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(outputNode);
      return;
    } else if (env === 'hall') {
      // Long stone hall reverb delay
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.22;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.38;

      delay.connect(feedback);
      feedback.connect(delay);

      inputNode.connect(outputNode);
      inputNode.connect(delay);
      delay.connect(outputNode);
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
        const y = mid + Math.sin(x * 0.05 + Date.now() * 0.003) * 4;
        if (x === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
      }
      canvasCtx.stroke();
      if (isPlaying || isRecordingMic) animId = requestAnimationFrame(drawVisualizer);
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
      const hue = 45 + (i / bufferLength) * 30; // Warm amber gold
      canvasCtx.fillStyle = `hsl(${hue}, 95%, ${45 + (data[i] / 255) * 30}%)`;
      canvasCtx.fillRect(x, height - h, barWidth - 1, h);
      x += barWidth;
    }
    animId = requestAnimationFrame(drawVisualizer);
  }
  drawVisualizer();

  // Test Chime
  previewChimeBtn.addEventListener('click', () => {
    const ctx = getAudioContext();
    const chimeBus = ctx.createGain();
    applyEnvironmentFilter(ctx, chimeBus, analyserNode, environmentFilter.value);
    playTourChime(ctx, chimeBus, selectedChime);
    isPlaying = true;
    studioStatus.textContent = `Testing ${selectedChime}...`;
    drawVisualizer();

    setTimeout(() => {
      isPlaying = false;
      studioStatus.textContent = 'Guide System Ready';
    }, 1500);
  });

  // Play Tour Announcement
  playTourBtn.addEventListener('click', () => {
    const text = tourScript.value.trim();
    if (!text && !recordedMicAudioBuffer) {
      alert('Please enter announcement text or record guide narration.');
      return;
    }

    const ctx = getAudioContext();
    isPlaying = true;
    playTourBtn.disabled = true;
    stopTourBtn.disabled = false;
    studioStatus.textContent = 'Broadcasting Tour Guide Announcement...';
    drawVisualizer();

    // 1. Play Chime
    const chimeBus = ctx.createGain();
    applyEnvironmentFilter(ctx, chimeBus, analyserNode, environmentFilter.value);
    const chimeDur = playTourChime(ctx, chimeBus, selectedChime);

    // 2. Play Guide Voice
    if (recordedMicAudioBuffer) {
      setTimeout(() => {
        if (!isPlaying) return;
        const src = ctx.createBufferSource();
        src.buffer = recordedMicAudioBuffer;
        const vBus = ctx.createGain();
        applyEnvironmentFilter(ctx, vBus, analyserNode, environmentFilter.value);
        src.connect(vBus);
        src.start();
        src.onended = finishPlayback;
      }, chimeDur * 1000 + 150);
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
        if (!isPlaying) return;
        window.speechSynthesis.speak(utt);
      }, chimeDur * 1000 + 150);
    }
  });

  function finishPlayback() {
    isPlaying = false;
    playTourBtn.disabled = false;
    stopTourBtn.disabled = true;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    studioStatus.textContent = 'Broadcast Complete';
    setTimeout(() => { studioStatus.textContent = 'Guide System Ready'; }, 2000);
  }

  stopTourBtn.addEventListener('click', finishPlayback);

  // Mic Recording
  recordMicBtn.addEventListener('click', async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone not supported.');
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
          micRecordingStatus.textContent = `Guide voice saved (${recordedMicAudioBuffer.duration.toFixed(1)}s). Ready to broadcast!`;
          micRecordingStatus.style.color = '#10b981';
        } catch {
          micRecordingStatus.textContent = 'Voice saved.';
        }
        isRecordingMic = false;
        recordMicBtn.style.display = 'inline-flex';
        stopMicBtn.style.display = 'none';
        stopMicBtn.disabled = true;
        studioStatus.textContent = 'Guide Narration Saved';
      };

      mediaRecorder.start();
      isRecordingMic = true;
      recordMicBtn.style.display = 'none';
      stopMicBtn.style.display = 'inline-flex';
      stopMicBtn.disabled = false;
      studioStatus.textContent = 'Recording Guide Mic...';
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

  // Export to WAV
  exportWavBtn.addEventListener('click', async () => {
    studioStatus.textContent = 'Rendering tour audio master...';
    const sampleRate = 44100;
    const chimeDur = 1.5;
    const voiceDur = recordedMicAudioBuffer ? recordedMicAudioBuffer.duration : 4.5;
    const totalDuration = chimeDur + voiceDur + 1.0;

    const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offCtx = new OfflineCtxClass(2, Math.ceil(totalDuration * sampleRate), sampleRate);

    // Chime
    const chimeBus = offCtx.createGain();
    applyEnvironmentFilter(offCtx, chimeBus, offCtx.destination, environmentFilter.value);
    playTourChime(offCtx, chimeBus, selectedChime, 0.2);

    // Voice
    if (recordedMicAudioBuffer) {
      const src = offCtx.createBufferSource();
      src.buffer = recordedMicAudioBuffer;
      const vBus = offCtx.createGain();
      applyEnvironmentFilter(offCtx, vBus, offCtx.destination, environmentFilter.value);
      src.connect(vBus);
      src.start(chimeDur + 0.3);
    }

    try {
      const renderedBuffer = await offCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);
      downloadBlob(wavBlob, `tour_announcement_${selectedChime}_${Date.now()}.wav`);
      studioStatus.textContent = 'WAV Export Ready!';
      setTimeout(() => { studioStatus.textContent = 'Guide System Ready'; }, 2500);
    } catch (err) {
      alert('Error rendering WAV audio: ' + err.message);
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