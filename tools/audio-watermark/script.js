// Audio Watermark Studio Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const dropzone = document.getElementById('dropzone');
  const audioFileInput = document.getElementById('audioFileInput');
  const loadDemoTrackBtn = document.getElementById('loadDemoTrackBtn');
  const audioFileMeta = document.getElementById('audioFileMeta');
  const metaTitle = document.getElementById('metaTitle');
  const metaDetails = document.getElementById('metaDetails');

  const watermarkType = document.getElementById('watermarkType');
  const customTextGroup = document.getElementById('customTextGroup');
  const customWatermarkText = document.getElementById('customWatermarkText');
  const intervalSec = document.getElementById('intervalSec');
  const intervalSecVal = document.getElementById('intervalSecVal');
  const watermarkVolume = document.getElementById('watermarkVolume');
  const watermarkVolumeVal = document.getElementById('watermarkVolumeVal');
  const duckingAmount = document.getElementById('duckingAmount');
  const duckingAmountVal = document.getElementById('duckingAmountVal');

  const playerStatus = document.getElementById('playerStatus');
  const playerTimer = document.getElementById('playerTimer');
  const waveformCanvas = document.getElementById('waveformCanvas');
  const canvasCtx = waveformCanvas ? waveformCanvas.getContext('2d') : null;

  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const renderWavBtn = document.getElementById('renderWavBtn');
  const renderProgressText = document.getElementById('renderProgressText');

  // Audio State
  let audioCtx = null;
  let sourceAudioBuffer = null;
  let currentSourceNode = null;
  let currentGainNode = null;
  let isPlaying = false;
  let isPaused = false;
  let playStartTime = 0;
  let pausedOffset = 0;
  let watermarkScheduleTimers = [];
  let animFrameId = null;

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

  // Format MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Input Sliders
  intervalSec.addEventListener('input', (e) => {
    intervalSecVal.textContent = `Every ${e.target.value}s`;
    drawWaveform();
  });
  watermarkVolume.addEventListener('input', (e) => {
    watermarkVolumeVal.textContent = `${e.target.value}%`;
  });
  duckingAmount.addEventListener('input', (e) => {
    duckingAmountVal.textContent = `${e.target.value}% Dip`;
  });

  watermarkType.addEventListener('change', () => {
    if (watermarkType.value === 'voice_custom') {
      customTextGroup.style.display = 'flex';
    } else {
      customTextGroup.style.display = 'none';
    }
  });

  // Dropzone Handlers
  dropzone.addEventListener('click', () => audioFileInput.click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadAudioFile(e.dataTransfer.files[0]);
    }
  });
  audioFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      loadAudioFile(e.target.files[0]);
    }
  });

  // Load Audio File
  async function loadAudioFile(file) {
    stopPlayback();
    playerStatus.textContent = 'Decoding audio file...';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = getAudioContext();
      sourceAudioBuffer = await ctx.decodeAudioData(arrayBuffer);

      metaTitle.textContent = file.name;
      metaDetails.textContent = `Duration: ${formatTime(sourceAudioBuffer.duration)} (${sourceAudioBuffer.duration.toFixed(1)}s) • Sample Rate: ${sourceAudioBuffer.sampleRate} Hz`;
      audioFileMeta.style.display = 'block';

      enableControls();
      drawWaveform();
      playerStatus.textContent = 'Track loaded & ready.';
    } catch (err) {
      alert('Could not decode audio file: ' + err.message);
      playerStatus.textContent = 'Failed to load audio.';
    }
  }

  // Generate Synthesized Demo Commercial Track (15s)
  loadDemoTrackBtn.addEventListener('click', async () => {
    stopPlayback();
    playerStatus.textContent = 'Synthesizing commercial demo track...';
    const sampleRate = 44100;
    const duration = 20.0;
    const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offCtx = new OfflineCtxClass(2, Math.ceil(duration * sampleRate), sampleRate);

    // Warm chord progression (Lo-Fi Commercial: Cmaj9 -> Am9 -> Fmaj7 -> G7)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];

    chords.forEach((chord, i) => {
      const start = i * 4.5;
      chord.forEach(freq => {
        const osc = offCtx.createOscillator();
        const gain = offCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.2);
        gain.gain.setValueAtTime(0.10, start + 3.8);
        gain.gain.linearRampToValueAtTime(0.001, start + 4.4);

        osc.connect(gain);
        gain.connect(offCtx.destination);
        osc.start(start);
        osc.stop(start + 4.5);
      });
    });

    // Add gentle rhythmic kick & shaker
    for (let t = 0; t < duration; t += 1.0) {
      // Gentle kick
      const kickOsc = offCtx.createOscillator();
      const kickGain = offCtx.createGain();
      kickOsc.frequency.setValueAtTime(120, t);
      kickOsc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      kickGain.gain.setValueAtTime(0.3, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      kickOsc.connect(kickGain);
      kickGain.connect(offCtx.destination);
      kickOsc.start(t);
      kickOsc.stop(t + 0.2);
    }

    try {
      sourceAudioBuffer = await offCtx.startRendering();
      metaTitle.textContent = 'Commercial_Lounge_Demo.wav (Synthesized)';
      metaDetails.textContent = `Duration: ${formatTime(sourceAudioBuffer.duration)} (20.0s) • Sample Rate: 44.1 kHz • Stereo`;
      audioFileMeta.style.display = 'block';
      enableControls();
      drawWaveform();
      playerStatus.textContent = 'Demo track loaded!';
    } catch (err) {
      alert('Error generating demo track: ' + err.message);
    }
  });

  function enableControls() {
    playBtn.disabled = false;
    renderWavBtn.disabled = false;
    playerTimer.textContent = `00:00 / ${formatTime(sourceAudioBuffer.duration)}`;
  }

  // Draw Waveform and Watermark Markers
  function drawWaveform(currentPlaybackSec = 0) {
    if (!waveformCanvas || !canvasCtx || !sourceAudioBuffer) return;
    const width = waveformCanvas.width = waveformCanvas.clientWidth || 400;
    const height = waveformCanvas.height = waveformCanvas.clientHeight || 120;

    canvasCtx.fillStyle = '#050508';
    canvasCtx.fillRect(0, 0, width, height);

    // Draw audio peaks
    const channelData = sourceAudioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    const mid = height / 2;

    canvasCtx.fillStyle = 'rgba(245, 158, 11, 0.45)';
    for (let x = 0; x < width; x++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const val = channelData[(x * step) + j] || 0;
        if (val < min) min = val;
        if (val > max) max = val;
      }
      const yMin = mid + min * (mid - 8);
      const yMax = mid + max * (mid - 8);
      canvasCtx.fillRect(x, yMin, 1, Math.max(2, yMax - yMin));
    }

    // Draw Watermark Interval Markers
    const interval = parseFloat(intervalSec.value) || 10;
    const totalDuration = sourceAudioBuffer.duration;

    for (let t = interval; t < totalDuration; t += interval) {
      const markerX = (t / totalDuration) * width;

      // Vertical Marker Line
      canvasCtx.strokeStyle = '#f59e0b';
      canvasCtx.lineWidth = 2;
      canvasCtx.setLineDash([4, 4]);
      canvasCtx.beginPath();
      canvasCtx.moveTo(markerX, 0);
      canvasCtx.lineTo(markerX, height);
      canvasCtx.stroke();
      canvasCtx.setLineDash([]);

      // Badge
      canvasCtx.fillStyle = '#f59e0b';
      canvasCtx.fillRect(markerX - 12, 4, 24, 14);
      canvasCtx.fillStyle = '#000';
      canvasCtx.font = 'bold 9px monospace';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText('WM', markerX, 14);
    }

    // Draw Playback Position Cursor
    if (isPlaying || isPaused) {
      const cursorX = (currentPlaybackSec / totalDuration) * width;
      canvasCtx.strokeStyle = '#3b82f6';
      canvasCtx.lineWidth = 2;
      canvasCtx.beginPath();
      canvasCtx.moveTo(cursorX, 0);
      canvasCtx.lineTo(cursorX, height);
      canvasCtx.stroke();
    }
  }

  // Seek on click
  waveformCanvas.addEventListener('click', (e) => {
    if (!sourceAudioBuffer) return;
    const rect = waveformCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekSec = (clickX / rect.width) * sourceAudioBuffer.duration;

    if (isPlaying) {
      startPlayback(seekSec);
    } else {
      pausedOffset = seekSec;
      drawWaveform(seekSec);
      playerTimer.textContent = `${formatTime(seekSec)} / ${formatTime(sourceAudioBuffer.duration)}`;
    }
  });

  // Synthesize Watermark Sound into AudioContext / OfflineAudioContext
  function triggerWatermarkAudio(ctx, dest, type, volumeVal, triggerTime = 0) {
    const t = triggerTime || ctx.currentTime;
    const volGain = ctx.createGain();
    volGain.gain.setValueAtTime((volumeVal / 100) * 0.9, t);
    volGain.connect(dest);

    if (type === 'beep_chime') {
      // Dual high chime
      [1200, 1500].forEach(freq => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(g);
        g.connect(volGain);
        osc.start(t);
        osc.stop(t + 0.36);
      });
    } else if (type === 'beep_single') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(1000, t);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(g);
      g.connect(volGain);
      osc.start(t);
      osc.stop(t + 0.26);
    } else if (type === 'noise_burst') {
      // White noise buffer burst
      const bufSize = Math.floor(ctx.sampleRate * 0.15);
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const out = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        out[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
      }
      const node = ctx.createBufferSource();
      node.buffer = noiseBuf;
      node.connect(volGain);
      node.start(t);
    } else {
      // Spoken Voice Formant Watermark ("PRE-VIEW" / "AU-DIO")
      // Synthesize multi-formant robotic vocal stamp
      const syllables = [
        { f1: 300, f2: 1800, len: 0.18, offset: 0 },    // "Pre"
        { f1: 450, f2: 1200, len: 0.28, offset: 0.22 }  // "View"
      ];
      syllables.forEach(s => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t + s.offset);

        const bp1 = ctx.createBiquadFilter();
        bp1.type = 'bandpass';
        bp1.frequency.setValueAtTime(s.f1, t + s.offset);
        bp1.Q.setValueAtTime(4.0, t + s.offset);

        const bp2 = ctx.createBiquadFilter();
        bp2.type = 'bandpass';
        bp2.frequency.setValueAtTime(s.f2, t + s.offset);
        bp2.Q.setValueAtTime(4.0, t + s.offset);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t + s.offset);
        g.gain.linearRampToValueAtTime(0.5, t + s.offset + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + s.offset + s.len);

        osc.connect(bp1);
        osc.connect(bp2);
        bp1.connect(g);
        bp2.connect(g);
        g.connect(volGain);

        osc.start(t + s.offset);
        osc.stop(t + s.offset + s.len + 0.05);
      });
    }
  }

  // Live Playback Engine
  function startPlayback(offsetSec = 0) {
    stopPlayback();
    if (!sourceAudioBuffer) return;

    const ctx = getAudioContext();
    currentSourceNode = ctx.createBufferSource();
    currentSourceNode.buffer = sourceAudioBuffer;

    currentGainNode = ctx.createGain();
    currentGainNode.gain.setValueAtTime(1.0, ctx.currentTime);

    currentSourceNode.connect(currentGainNode);
    currentGainNode.connect(ctx.destination);

    currentSourceNode.start(0, offsetSec);
    playStartTime = ctx.currentTime - offsetSec;
    pausedOffset = offsetSec;
    isPlaying = true;
    isPaused = false;

    playBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    playerStatus.textContent = 'Playing track with active watermarks...';

    // Schedule Watermarks along the track
    const interval = parseFloat(intervalSec.value) || 10;
    const vol = parseFloat(watermarkVolume.value) || 70;
    const ducking = parseFloat(duckingAmount.value) || 40;
    const totalDuration = sourceAudioBuffer.duration;

    watermarkScheduleTimers = [];
    for (let t = interval; t < totalDuration; t += interval) {
      if (t >= offsetSec) {
        const delay = (t - offsetSec) * 1000;
        const timerId = setTimeout(() => {
          if (!isPlaying) return;
          // Trigger Watermark
          triggerWatermarkAudio(ctx, ctx.destination, watermarkType.value, vol);

          // Apply Ducking to background music
          if (ducking > 0 && currentGainNode) {
            const duckGain = Math.max(0.1, 1 - (ducking / 100));
            currentGainNode.gain.linearRampToValueAtTime(duckGain, ctx.currentTime + 0.05);
            currentGainNode.gain.setValueAtTime(duckGain, ctx.currentTime + 0.6);
            currentGainNode.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.9);
          }
        }, delay);
        watermarkScheduleTimers.push(timerId);
      }
    }

    currentSourceNode.onended = () => {
      if (isPlaying && ctx.currentTime - playStartTime >= sourceAudioBuffer.duration - 0.2) {
        stopPlayback();
        playerStatus.textContent = 'Playback completed.';
      }
    };

    // Animation Loop
    function updateProgress() {
      if (!isPlaying) return;
      const current = ctx.currentTime - playStartTime;
      drawWaveform(current);
      playerTimer.textContent = `${formatTime(current)} / ${formatTime(sourceAudioBuffer.duration)}`;
      animFrameId = requestAnimationFrame(updateProgress);
    }
    updateProgress();
  }

  function pausePlayback() {
    if (!isPlaying) return;
    const ctx = getAudioContext();
    pausedOffset = ctx.currentTime - playStartTime;
    stopPlayback();
    isPaused = true;
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = false;
    playerStatus.textContent = 'Paused.';
    drawWaveform(pausedOffset);
  }

  function stopPlayback() {
    isPlaying = false;
    isPaused = false;
    watermarkScheduleTimers.forEach(id => clearTimeout(id));
    watermarkScheduleTimers = [];

    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (currentSourceNode) {
      try { currentSourceNode.stop(); } catch {}
      currentSourceNode.disconnect();
      currentSourceNode = null;
    }
    if (currentGainNode) {
      currentGainNode.disconnect();
      currentGainNode = null;
    }

    playBtn.disabled = !sourceAudioBuffer;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    if (sourceAudioBuffer) {
      drawWaveform(0);
      playerTimer.textContent = `00:00 / ${formatTime(sourceAudioBuffer.duration)}`;
    }
  }

  playBtn.addEventListener('click', () => {
    startPlayback(isPaused ? pausedOffset : 0);
  });
  pauseBtn.addEventListener('click', pausePlayback);
  stopBtn.addEventListener('click', stopPlayback);

  // Render & Download Watermarked WAV
  renderWavBtn.addEventListener('click', async () => {
    if (!sourceAudioBuffer) return;
    stopPlayback();

    renderWavBtn.disabled = true;
    renderProgressText.textContent = 'Rendering watermarked audio master in-browser...';

    const sampleRate = sourceAudioBuffer.sampleRate || 44100;
    const duration = sourceAudioBuffer.duration;
    const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offCtx = new OfflineCtxClass(sourceAudioBuffer.numberOfChannels, Math.ceil(duration * sampleRate), sampleRate);

    // 1. Source Track
    const sourceNode = offCtx.createBufferSource();
    sourceNode.buffer = sourceAudioBuffer;
    const mainGainNode = offCtx.createGain();
    mainGainNode.gain.setValueAtTime(1.0, 0);

    sourceNode.connect(mainGainNode);
    mainGainNode.connect(offCtx.destination);
    sourceNode.start(0);

    // 2. Schedule all watermarks & ducking
    const interval = parseFloat(intervalSec.value) || 10;
    const vol = parseFloat(watermarkVolume.value) || 70;
    const ducking = parseFloat(duckingAmount.value) || 40;

    for (let t = interval; t < duration; t += interval) {
      // Trigger watermark
      triggerWatermarkAudio(offCtx, offCtx.destination, watermarkType.value, vol, t);

      // Duck main track
      if (ducking > 0) {
        const duckGain = Math.max(0.1, 1 - (ducking / 100));
        mainGainNode.gain.setValueAtTime(1.0, t);
        mainGainNode.gain.linearRampToValueAtTime(duckGain, t + 0.05);
        mainGainNode.gain.setValueAtTime(duckGain, t + 0.6);
        mainGainNode.gain.linearRampToValueAtTime(1.0, t + 0.9);
      }
    }

    try {
      const renderedBuffer = await offCtx.startRendering();
      const wavBlob = audioBufferToWav(renderedBuffer);
      downloadBlob(wavBlob, `protected_audio_${Date.now()}.wav`);
      renderProgressText.textContent = 'Protection Complete! Download started.';
      renderWavBtn.disabled = false;
      setTimeout(() => {
        renderProgressText.textContent = '';
      }, 4000);
    } catch (err) {
      alert('Error rendering watermarked audio: ' + err.message);
      renderProgressText.textContent = 'Render failed.';
      renderWavBtn.disabled = false;
    }
  });

  // WAV Encoder Helper
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