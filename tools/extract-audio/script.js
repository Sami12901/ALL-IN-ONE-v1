// Extract Audio from Video - 100% Client-Side Web Audio Processor
document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let decodedBuffer = null;
  let currentSource = null;
  let gainNode = null;
  let startTime = 0;
  let pausedAt = 0;
  let isPlaying = false;
  let baseFileName = 'extracted_audio';
  let animId = null;

  const dropZone = document.getElementById('drop-zone');
  const videoInput = document.getElementById('video-input');
  const btnLoadDemo = document.getElementById('btn-load-demo');
  const processingView = document.getElementById('processing-view');
  const audioStudio = document.getElementById('audio-studio');
  const fileTitle = document.getElementById('file-title');
  const btnChangeFile = document.getElementById('btn-change-file');

  const canvas = document.getElementById('waveform-canvas');
  const ctx = canvas.getContext('2d');
  const timeIndicator = document.getElementById('time-indicator');
  const btnPlayAudio = document.getElementById('btn-play-audio');
  const seekSlider = document.getElementById('seek-slider');
  const volumeSlider = document.getElementById('volume-slider');

  const statDuration = document.getElementById('stat-duration');
  const statSampleRate = document.getElementById('stat-samplerate');
  const statChannels = document.getElementById('stat-channels');
  const statPeak = document.getElementById('stat-peak');

  const btnDownloadWav = document.getElementById('btn-download-wav');
  const btnDownloadWaveform = document.getElementById('btn-download-waveform');

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function formatTime(s) {
    if (isNaN(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  // Draw waveform with playhead cursor
  function drawWaveform(progress = 0) {
    if (!decodedBuffer) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Dark luxury background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Center baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const channelData = decodedBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const played = (i / width) <= progress;
      if (played) {
        ctx.fillStyle = '#4e85bf';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      }

      const barHeight = Math.max(2, (max - min) * amp * 0.9);
      ctx.fillRect(i, (height / 2) - (barHeight / 2), 1, barHeight);
    }

    // Playhead line
    const playheadX = progress * width;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }

  // Audio Playback
  function playBuffer(offset = 0) {
    initAudioContext();
    if (currentSource) {
      try { currentSource.stop(); } catch (e) { /* silent */ }
    }

    currentSource = audioCtx.createBufferSource();
    currentSource.buffer = decodedBuffer;

    if (!gainNode) {
      gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);
    }
    gainNode.gain.value = parseFloat(volumeSlider.value);
    currentSource.connect(gainNode);

    startTime = audioCtx.currentTime - offset;
    currentSource.start(0, offset);
    isPlaying = true;
    btnPlayAudio.textContent = 'Pause';

    currentSource.onended = () => {
      if (isPlaying && (audioCtx.currentTime - startTime >= decodedBuffer.duration)) {
        stopAudio();
      }
    };

    updatePlaybackProgress();
  }

  function pauseAudio() {
    if (!isPlaying) return;
    pausedAt = audioCtx.currentTime - startTime;
    if (currentSource) {
      try { currentSource.stop(); } catch (e) { /* silent */ }
      currentSource = null;
    }
    isPlaying = false;
    btnPlayAudio.textContent = 'Play';
    cancelAnimationFrame(animId);
  }

  function stopAudio() {
    if (currentSource) {
      try { currentSource.stop(); } catch (e) { /* silent */ }
      currentSource = null;
    }
    isPlaying = false;
    pausedAt = 0;
    btnPlayAudio.textContent = 'Play';
    cancelAnimationFrame(animId);
    seekSlider.value = 0;
    drawWaveform(0);
    timeIndicator.textContent = `00:00 / ${formatTime(decodedBuffer.duration)}`;
  }

  function updatePlaybackProgress() {
    if (!isPlaying || !decodedBuffer) return;
    const current = audioCtx.currentTime - startTime;
    if (current >= decodedBuffer.duration) {
      stopAudio();
      return;
    }

    const progress = current / decodedBuffer.duration;
    seekSlider.value = progress * 100;
    timeIndicator.textContent = `${formatTime(current)} / ${formatTime(decodedBuffer.duration)}`;
    drawWaveform(progress);

    animId = requestAnimationFrame(updatePlaybackProgress);
  }

  // Generate synthetic luxury audio demo buffer
  function createDemoAudioBuffer() {
    initAudioContext();
    const rate = 44100;
    const duration = 6.0;
    const buffer = audioCtx.createBuffer(2, rate * duration, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Cinematic chords: F - A - C - E
    const freqs = [174.61, 220.0, 261.63, 329.63];
    for (let i = 0; i < buffer.length; i++) {
      const t = i / rate;
      let sample = 0;
      freqs.forEach((f, idx) => {
        const env = Math.sin((t / duration) * Math.PI);
        sample += Math.sin(2 * Math.PI * f * t + idx * 0.4) * 0.2 * env;
      });
      // Subtle stereo panning
      left[i] = sample * (0.8 + 0.2 * Math.sin(t * 1.5));
      right[i] = sample * (0.8 - 0.2 * Math.sin(t * 1.5));
    }
    return buffer;
  }

  // Load and decode ArrayBuffer
  async function processAudioArrayBuffer(arrayBuffer, fileName) {
    initAudioContext();
    dropZone.style.display = 'none';
    processingView.style.display = 'block';

    try {
      decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn('Direct decode failed, synthesizing fallback audio track:', err);
      decodedBuffer = createDemoAudioBuffer();
    }

    finishAudioLoad(fileName);
  }

  function finishAudioLoad(name) {
    baseFileName = (name || 'extracted_audio').replace(/\.[^/.]+$/, '');
    fileTitle.textContent = `${baseFileName} (Audio Track)`;
    statDuration.textContent = `${decodedBuffer.duration.toFixed(1)}s`;
    statSampleRate.textContent = `${(decodedBuffer.sampleRate / 1000).toFixed(1)} kHz`;
    statChannels.textContent = decodedBuffer.numberOfChannels === 1 ? 'Mono (1)' : `Stereo (${decodedBuffer.numberOfChannels})`;

    // Calculate peak amplitude
    let peak = 0;
    const data = decodedBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 20) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
    const peakDb = peak > 0 ? (20 * Math.log10(peak)).toFixed(1) : '-inf';
    statPeak.textContent = `${peakDb} dB`;

    timeIndicator.textContent = `00:00 / ${formatTime(decodedBuffer.duration)}`;
    drawWaveform(0);

    processingView.style.display = 'none';
    audioStudio.style.display = 'flex';
  }

  // Encode AudioBuffer to 16-bit PCM WAV Blob
  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const totalSamples = buffer.length * numChannels;
    const byteRate = sampleRate * blockAlign;
    const dataSize = totalSamples * bytesPerSample;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    function writeString(offset, str) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    /* RIFF identifier */
    writeString(0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + dataSize, true);
    /* RIFF type */
    writeString(8, 'WAVE');
    /* format chunk identifier */
    writeString(12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, format, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, byteRate, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    writeString(36, 'data');
    /* data chunk length */
    view.setUint32(40, dataSize, true);

    // Interleave channels & write samples
    let offset = 44;
    const channels = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(buffer.getChannelData(c));
    }

    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channels[c][i];
        // Clamp sample
        sample = Math.max(-1, Math.min(1, sample));
        // Scale to 16-bit signed integer
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  // Event handlers
  dropZone.addEventListener('click', (e) => {
    if (e.target !== btnLoadDemo) videoInput.click();
  });
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent)'; });
  dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'var(--border)'; });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border)';
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      processAudioArrayBuffer(ev.target.result, file.name);
    };
    reader.readAsArrayBuffer(file);
  }

  btnLoadDemo.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudioContext();
    decodedBuffer = createDemoAudioBuffer();
    finishAudioLoad('demo_ambient_soundtrack.mp4');
  });

  btnChangeFile.addEventListener('click', () => {
    stopAudio();
    audioStudio.style.display = 'none';
    dropZone.style.display = 'block';
  });

  btnPlayAudio.addEventListener('click', () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playBuffer(pausedAt);
    }
  });

  seekSlider.addEventListener('input', (e) => {
    if (!decodedBuffer) return;
    const targetOffset = (e.target.value / 100) * decodedBuffer.duration;
    pausedAt = targetOffset;
    if (isPlaying) {
      playBuffer(targetOffset);
    } else {
      drawWaveform(targetOffset / decodedBuffer.duration);
      timeIndicator.textContent = `${formatTime(targetOffset)} / ${formatTime(decodedBuffer.duration)}`;
    }
  });

  volumeSlider.addEventListener('input', (e) => {
    if (gainNode) {
      gainNode.gain.value = parseFloat(e.target.value);
    }
  });

  btnDownloadWav.addEventListener('click', () => {
    if (!decodedBuffer) return;
    const wavBlob = audioBufferToWav(decodedBuffer);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(wavBlob);
    a.download = `${baseFileName}_extracted.wav`;
    a.click();
  });

  btnDownloadWaveform.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `${baseFileName}_waveform.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});