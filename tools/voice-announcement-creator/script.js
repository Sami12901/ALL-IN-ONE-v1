// Voice Announcement Creator - Web Audio & Speech Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const announcementText = document.getElementById('announcementText');
  const voiceSelect = document.getElementById('voiceSelect');
  const voiceRate = document.getElementById('voiceRate');
  const voiceRateVal = document.getElementById('voiceRateVal');
  const voicePitch = document.getElementById('voicePitch');
  const voicePitchVal = document.getElementById('voicePitchVal');
  const acousticFilter = document.getElementById('acousticFilter');

  const playAnnouncementBtn = document.getElementById('playAnnouncementBtn');
  const stopAnnouncementBtn = document.getElementById('stopAnnouncementBtn');
  const previewChimeBtn = document.getElementById('previewChimeBtn');
  const exportWavBtn = document.getElementById('exportWavBtn');

  const recordMicBtn = document.getElementById('recordMicBtn');
  const stopMicBtn = document.getElementById('stopMicBtn');
  const micRecordingStatus = document.getElementById('micRecordingStatus');

  const studioStatus = document.getElementById('studioStatus');
  const statusPulse = document.getElementById('statusPulse');
  const playbackTimer = document.getElementById('playbackTimer');
  const canvas = document.getElementById('visualizerCanvas');
  const canvasCtx = canvas ? canvas.getContext('2d') : null;

  const presetPills = document.querySelectorAll('.preset-pill');
  const chimeCards = document.querySelectorAll('.chime-card');

  // Audio State
  let audioCtx = null;
  let analyserNode = null;
  let animationId = null;
  let selectedChime = 'airport';
  let isPlaying = false;
  let isRecordingMic = false;
  let mediaRecorder = null;
  let micStream = null;
  let recordedMicChunks = [];
  let recordedMicAudioBuffer = null;
  let availableVoices = [];

  // Preset Scripts
  const presets = {
    retail: "Attention shoppers, our store will be closing in 15 minutes. Please proceed to the checkout registers with your final selections. Thank you for shopping with us and have a pleasant evening.",
    flight: "This is the final boarding call for passengers on flight EK 202 to Dubai. Gate B24 is now closing. All remaining ticketed passengers please proceed immediately to the gate.",
    flash: "Attention valued customers! Our 30-minute flash sale has just begun in the central atrium. Enjoy an exclusive 40 percent discount on all premium accessories until 5 PM.",
    drill: "Attention all building occupants. This is a scheduled evacuation drill. Please remain calm, cease work, and proceed toward the nearest emergency exit as instructed by your floor warden.",
    keynote: "Ladies and gentlemen, the grand keynote presentation will commence in five minutes inside the Grand Ballroom. Please take your seats and switch your mobile devices to silent mode.",
    custom: ""
  };

  // Set Default Text
  announcementText.value = presets.retail;

  // Initialize Audio Context on demand
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

  // Populate Speech Synthesis Voices
  function populateVoices() {
    if (!window.speechSynthesis) {
      voiceSelect.innerHTML = '<option value="">Speech synthesis not supported in this browser</option>';
      return;
    }
    availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length === 0) return;

    voiceSelect.innerHTML = '';
    let defaultIndex = 0;

    availableVoices.forEach((voice, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — [Default]' : ''}`;
      if (voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Samantha') || voice.name.includes('Daniel'))) {
        defaultIndex = index;
      }
      voiceSelect.appendChild(opt);
    });

    if (voiceSelect.options.length > defaultIndex) {
      voiceSelect.selectedIndex = defaultIndex;
    }
  }

  if (window.speechSynthesis) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Handle Preset Clicks
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      presetPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const key = pill.getAttribute('data-preset');
      if (presets[key] !== undefined) {
        announcementText.value = presets[key];
      }
    });
  });

  // Handle Chime Selection
  chimeCards.forEach(card => {
    card.addEventListener('click', () => {
      chimeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedChime = card.getAttribute('data-chime');
    });
  });

  // Slider Updates
  voiceRate.addEventListener('input', (e) => {
    voiceRateVal.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
  });
  voicePitch.addEventListener('input', (e) => {
    voicePitchVal.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
  });

  // Synthesize Chime in AudioContext (or OfflineAudioContext)
  function playSynthesizedChime(ctx, outputNode, chimeType, startTime = 0) {
    if (chimeType === 'none') return 0.1;

    const t = startTime || ctx.currentTime;
    let duration = 1.6;

    if (chimeType === 'airport') {
      // Classic Ding-Dong: F#4 (369.99 Hz) -> D4 (293.66 Hz)
      playBellTone(ctx, outputNode, 370, t, 0.7);
      playBellTone(ctx, outputNode, 293.66, t + 0.45, 0.9);
      duration = 1.5;
    } else if (chimeType === 'westminster') {
      // Westminster Quarters: G#4, F#4, E4, B3
      playBellTone(ctx, outputNode, 415.3, t, 0.5);
      playBellTone(ctx, outputNode, 369.9, t + 0.38, 0.5);
      playBellTone(ctx, outputNode, 329.6, t + 0.76, 0.5);
      playBellTone(ctx, outputNode, 246.9, t + 1.14, 0.8);
      duration = 2.1;
    } else if (chimeType === 'marimba') {
      // Modern Double Marimba Tap: C5 (523.25) -> G5 (783.99)
      playMarimbaTone(ctx, outputNode, 523.25, t, 0.35);
      playMarimbaTone(ctx, outputNode, 783.99, t + 0.22, 0.5);
      duration = 0.9;
    } else if (chimeType === 'bell') {
      // Resonant Gong Bell
      playBellTone(ctx, outputNode, 220, t, 2.0, true);
      duration = 2.2;
    } else if (chimeType === 'subtle') {
      // Ascending Triad: C5 -> E5 -> G5
      playBellTone(ctx, outputNode, 523.25, t, 0.4);
      playBellTone(ctx, outputNode, 659.25, t + 0.25, 0.4);
      playBellTone(ctx, outputNode, 783.99, t + 0.5, 0.7);
      duration = 1.4;
    }
    return duration;
  }

  function playBellTone(ctx, dest, freq, start, length, isDeep = false) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, start);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * (isDeep ? 2.76 : 2.01), start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.4, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start(start);
    osc2.start(start);
    osc1.stop(start + length + 0.05);
    osc2.stop(start + length + 0.05);
  }

  function playMarimbaTone(ctx, dest, freq, start, length) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.5, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(start);
    osc.stop(start + length + 0.02);
  }

  // Create Acoustic Filter Chain
  function createAcousticChain(ctx, inputNode, outputNode, filterMode) {
    if (filterMode === 'clean') {
      inputNode.connect(outputNode);
      return;
    }

    if (filterMode === 'pa') {
      // PA Bandpass megaphone filter
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1450;
      bandpass.Q.value = 1.1;

      const delay = ctx.createDelay();
      delay.delayTime.value = 0.14;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.28;

      delay.connect(feedback);
      feedback.connect(delay);

      const gain = ctx.createGain();
      gain.gain.value = 1.4;

      inputNode.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(outputNode);
      gain.connect(delay);
      delay.connect(outputNode);
      return;
    }

    if (filterMode === 'mall') {
      // Ceiling speaker highpass + subtle room reflection
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 350;

      const delay = ctx.createDelay();
      delay.delayTime.value = 0.08;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.2;

      inputNode.connect(highpass);
      highpass.connect(outputNode);
      highpass.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(outputNode);
      return;
    }

    if (filterMode === 'station') {
      // Large echo hall
      const delay1 = ctx.createDelay();
      delay1.delayTime.value = 0.24;
      const feedback1 = ctx.createGain();
      feedback1.gain.value = 0.42;

      delay1.connect(feedback1);
      feedback1.connect(delay1);

      inputNode.connect(outputNode);
      inputNode.connect(delay1);
      delay1.connect(outputNode);
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
      // Idle wave
      canvasCtx.fillStyle = '#050508';
      canvasCtx.fillRect(0, 0, width, height);

      canvasCtx.lineWidth = 1.5;
      canvasCtx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      canvasCtx.beginPath();
      const mid = height / 2;
      for (let x = 0; x < width; x += 3) {
        const y = mid + Math.sin(x * 0.04 + Date.now() * 0.003) * 4;
        if (x === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
      }
      canvasCtx.stroke();
      if (isPlaying || isRecordingMic) {
        animationId = requestAnimationFrame(drawVisualizer);
      }
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = '#050508';
    canvasCtx.fillRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 2.2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * (height - 10);
      const hue = 38 + (i / bufferLength) * 25; // Gold / amber spectrum
      canvasCtx.fillStyle = `hsl(${hue}, 95%, ${45 + (dataArray[i] / 255) * 25}%)`;
      canvasCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      x += barWidth;
    }

    animationId = requestAnimationFrame(drawVisualizer);
  }

  drawVisualizer();

  // Test Chime Only
  previewChimeBtn.addEventListener('click', () => {
    const ctx = getAudioContext();
    const chimeBus = ctx.createGain();
    createAcousticChain(ctx, chimeBus, analyserNode, acousticFilter.value);
    playSynthesizedChime(ctx, chimeBus, selectedChime);
    isPlaying = true;
    statusPulse.classList.add('active');
    studioStatus.textContent = `Testing ${selectedChime} chime...`;
    drawVisualizer();
    setTimeout(() => {
      isPlaying = false;
      statusPulse.classList.remove('active');
      studioStatus.textContent = 'Engine Ready';
    }, 1800);
  });

  // Play Full Announcement
  playAnnouncementBtn.addEventListener('click', () => {
    const text = announcementText.value.trim();
    if (!text && !recordedMicAudioBuffer) {
      alert('Please enter announcement text or record voice with your microphone.');
      return;
    }

    const ctx = getAudioContext();
    isPlaying = true;
    playAnnouncementBtn.disabled = true;
    stopAnnouncementBtn.disabled = false;
    statusPulse.classList.add('active');
    studioStatus.textContent = 'Broadcasting Announcement...';
    drawVisualizer();

    // 1. Play Chime first
    const chimeBus = ctx.createGain();
    createAcousticChain(ctx, chimeBus, analyserNode, acousticFilter.value);
    const chimeDuration = playSynthesizedChime(ctx, chimeBus, selectedChime);

    // 2. If recorded mic voice is present, play it through the acoustic filter!
    if (recordedMicAudioBuffer) {
      setTimeout(() => {
        if (!isPlaying) return;
        const source = ctx.createBufferSource();
        source.buffer = recordedMicAudioBuffer;
        const voiceBus = ctx.createGain();
        createAcousticChain(ctx, voiceBus, analyserNode, acousticFilter.value);
        source.connect(voiceBus);
        source.start();
        source.onended = () => {
          finishPlayback();
        };
      }, chimeDuration * 1000 + 150);
    } else if (window.speechSynthesis) {
      // Play via Speech Synthesis
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (availableVoices.length > 0 && voiceSelect.value !== '') {
        utterance.voice = availableVoices[parseInt(voiceSelect.value, 10)];
      }
      utterance.rate = parseFloat(voiceRate.value);
      utterance.pitch = parseFloat(voicePitch.value);

      utterance.onend = () => {
        finishPlayback();
      };
      utterance.onerror = () => {
        finishPlayback();
      };

      setTimeout(() => {
        if (!isPlaying) return;
        window.speechSynthesis.speak(utterance);
      }, chimeDuration * 1000 + 150);
    } else {
      setTimeout(finishPlayback, chimeDuration * 1000 + 500);
    }
  });

  function finishPlayback() {
    isPlaying = false;
    playAnnouncementBtn.disabled = false;
    stopAnnouncementBtn.disabled = true;
    statusPulse.classList.remove('active');
    studioStatus.textContent = 'Playback Complete';
    setTimeout(() => {
      studioStatus.textContent = 'Engine Ready';
    }, 2000);
  }

  stopAnnouncementBtn.addEventListener('click', () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    finishPlayback();
  });

  // Microphone Recording
  recordMicBtn.addEventListener('click', async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported by your browser.');
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
          micRecordingStatus.textContent = `Recorded voice ready (${recordedMicAudioBuffer.duration.toFixed(1)}s). Ready to blend with chime!`;
          micRecordingStatus.style.color = '#10b981';
        } catch {
          micRecordingStatus.textContent = 'Voice recorded successfully.';
        }
        isRecordingMic = false;
        recordMicBtn.style.display = 'inline-flex';
        stopMicBtn.style.display = 'none';
        stopMicBtn.disabled = true;
        statusPulse.classList.remove('active');
        studioStatus.textContent = 'Microphone Saved';
      };

      mediaRecorder.start();
      isRecordingMic = true;
      recordMicBtn.style.display = 'none';
      stopMicBtn.style.display = 'inline-flex';
      stopMicBtn.disabled = false;
      statusPulse.classList.add('active');
      studioStatus.textContent = 'Recording Microphone...';
      drawVisualizer();
    } catch (err) {
      alert('Could not access microphone: ' + err.message);
    }
  });

  stopMicBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
    }
  });

  // Export Chime + Announcement to WAV
  exportWavBtn.addEventListener('click', async () => {
    studioStatus.textContent = 'Rendering audio master...';
    const sampleRate = 44100;
    const chimeDur = 2.0;
    const voiceDur = recordedMicAudioBuffer ? recordedMicAudioBuffer.duration : 4.0;
    const totalDuration = chimeDur + voiceDur + 1.0;

    const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offlineCtx = new OfflineCtxClass(2, Math.ceil(totalDuration * sampleRate), sampleRate);

    // Render Chime into offline buffer
    const chimeBus = offlineCtx.createGain();
    createAcousticChain(offlineCtx, chimeBus, offlineCtx.destination, acousticFilter.value);
    playSynthesizedChime(offlineCtx, chimeBus, selectedChime, 0.2);

    // If recorded mic voice exists, blend it in
    if (recordedMicAudioBuffer) {
      const voiceSrc = offlineCtx.createBufferSource();
      voiceSrc.buffer = recordedMicAudioBuffer;
      const voiceBus = offlineCtx.createGain();
      createAcousticChain(offlineCtx, voiceBus, offlineCtx.destination, acousticFilter.value);
      voiceSrc.connect(voiceBus);
      voiceSrc.start(chimeDur + 0.3);
    }

    try {
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);
      downloadBlob(wavBlob, `announcement_${selectedChime}_${Date.now()}.wav`);
      studioStatus.textContent = 'WAV Export Ready!';
      setTimeout(() => {
        studioStatus.textContent = 'Engine Ready';
      }, 2500);
    } catch (err) {
      alert('Error rendering WAV audio: ' + err.message);
    }
  });

  // Helper: 16-bit PCM WAV Encoder
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
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // 16-bit
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