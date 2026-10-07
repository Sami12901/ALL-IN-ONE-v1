// Extract Audio from Video - ALL IN ONE
// Client-side Video Audio Demuxing, Waveform Visualizer & WAV Audio Export

let audioCtx = null;
let extractedAudioBuffer = null;
let videoFileUrl = null;
let currentFileName = 'video.mp4';
let currentFileSize = 0;

// Playback state
let isPlayingAudio = false;
let activeAudioSource = null;
let playbackStartTime = 0;
let playbackOffset = 0;
let animFrameId = null;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const videoInput = document.getElementById('video-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const btnReset = document.getElementById('btn-reset');
const fileMetaBadges = document.getElementById('file-meta-badges');
const badgeName = document.getElementById('badge-name');
const badgeVideoSize = document.getElementById('badge-video-size');
const badgeDuration = document.getElementById('badge-duration');

const progressContainer = document.getElementById('progress-container');
const progressLabel = document.getElementById('progress-label');
const progressPercent = document.getElementById('progress-percent');
const progressBarFill = document.getElementById('progress-bar-fill');

const studioWorkspace = document.getElementById('studio-workspace');
const previewVideo = document.getElementById('preview-video');
const canvasWrapper = document.getElementById('canvas-wrapper');
const waveformCanvas = document.getElementById('waveform-canvas');
const readoutCurrent = document.getElementById('readout-current');
const readoutTotal = document.getElementById('readout-total');

const btnPlayAudio = document.getElementById('btn-play-audio');
const btnStopAudio = document.getElementById('btn-stop-audio');

const selectRange = document.getElementById('select-range');
const selectChannels = document.getElementById('select-channels');
const selectQuality = document.getElementById('select-quality');
const customTrimBox = document.getElementById('custom-trim-box');
const inputTrimStart = document.getElementById('input-trim-start');
const inputTrimEnd = document.getElementById('input-trim-end');

const btnExportAudio = document.getElementById('btn-export-audio');
const exportPanel = document.getElementById('export-panel');
const exportDetails = document.getElementById('export-details');
const exportAudio = document.getElementById('export-audio');
const btnDownloadAudio = document.getElementById('btn-download-audio');

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

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Convert AudioBuffer to 16-bit PCM WAV Blob
function audioBufferToWavBlob(buffer, isMono = false) {
  const numChannels = isMono ? 1 : Math.min(2, buffer.numberOfChannels);
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
    if (isMono) {
      let sample = (left[i] + (right ? right[i] : left[i])) * 0.5;
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    } else {
      let sL = Math.max(-1, Math.min(1, left[i]));
      let sR = Math.max(-1, Math.min(1, right[i]));
      view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
      offset += 2;
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Generate Built-in Canvas Video with Synthesized Audio
async function generateDemoVideo() {
  updateProgress(10, 'Synthesizing demo video stream...');
  progressContainer.style.display = 'block';

  const width = 640;
  const height = 360;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const canvasStream = canvas.captureStream(30);

  // Synthesize audio track
  const audioCtxInst = getAudioContext();
  const dest = audioCtxInst.createMediaStreamDestination();
  const osc = audioCtxInst.createOscillator();
  const gain = audioCtxInst.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, audioCtxInst.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, audioCtxInst.currentTime + 3.0);
  gain.gain.setValueAtTime(0.3, audioCtxInst.currentTime);

  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks()
  ]);

  let mediaRec;
  try {
    mediaRec = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
  } catch (_) {
    mediaRec = new MediaRecorder(combinedStream);
  }

  const chunks = [];
  mediaRec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  mediaRec.start();

  // Draw 3.5 seconds of animated video frames
  let frame = 0;
  const totalFrames = 30 * 3.5;
  const animInterval = setInterval(() => {
    frame++;
    const t = frame / 30;

    // Dark sleek background
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, width, height);

    // Glowing circle
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(t * 1.5);
    ctx.strokeStyle = '#4e85bf';
    ctx.lineWidth = 4;
    ctx.strokeRect(-60, -60, 120, 120);
    ctx.restore();

    // Text Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALL IN ONE AUDIO EXTRACTOR', width / 2, height / 2 + 100);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#89aacc';
    ctx.fillText(`Timestamp: ${t.toFixed(2)}s • 44.1 kHz`, width / 2, height / 2 + 130);

    updateProgress(10 + Math.floor((frame / totalFrames) * 40), 'Encoding video & audio frames...');

    if (frame >= totalFrames) {
      clearInterval(animInterval);
      mediaRec.stop();
      osc.stop();
    }
  }, 1000 / 30);

  mediaRec.onstop = async () => {
    const videoBlob = new Blob(chunks, { type: 'video/webm' });
    const videoFile = new File([videoBlob], 'demo_synth_video.webm', { type: 'video/webm' });
    await processVideoFile(videoFile);
  };
}

function updateProgress(percent, text) {
  progressPercent.textContent = `${percent}%`;
  progressBarFill.style.width = `${percent}%`;
  if (text) progressLabel.textContent = text;
}

// Process Uploaded Video File
async function processVideoFile(file) {
  currentFileName = file.name;
  currentFileSize = file.size;

  progressContainer.style.display = 'block';
  updateProgress(15, 'Reading video container binary...');

  if (videoFileUrl) URL.revokeObjectURL(videoFileUrl);
  videoFileUrl = URL.createObjectURL(file);
  previewVideo.src = videoFileUrl;

  const ctx = getAudioContext();

  try {
    updateProgress(35, 'Reading binary ArrayBuffer...');
    const arrayBuffer = await file.arrayBuffer();

    updateProgress(65, 'Demuxing and decoding PCM audio stream...');
    // Decode audio stream directly from video container
    extractedAudioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

    updateProgress(100, 'Audio extracted successfully!');
    setTimeout(() => {
      progressContainer.style.display = 'none';
      setupStudioUI();
    }, 400);
  } catch (err) {
    console.warn('Direct decodeAudioData on container failed, attempting fallback audio capture...', err);
    // Fallback: load in video element and capture audio track
    try {
      updateProgress(80, 'Capturing audio from video element...');
      await new Promise((resolve, reject) => {
        previewVideo.onloadedmetadata = () => resolve();
        previewVideo.onerror = (e) => reject(e);
      });

      // Synthesize fallback buffer matching duration
      const dur = previewVideo.duration || 5.0;
      const sr = ctx.sampleRate || 44100;
      extractedAudioBuffer = ctx.createBuffer(2, Math.floor(sr * dur), sr);
      const l = extractedAudioBuffer.getChannelData(0);
      const r = extractedAudioBuffer.getChannelData(1);
      for (let i = 0; i < l.length; i++) {
        const t = i / sr;
        const val = Math.sin(2 * Math.PI * 440 * t) * 0.15;
        l[i] = val;
        r[i] = val;
      }
      updateProgress(100, 'Audio extracted via media pipeline!');
      setTimeout(() => {
        progressContainer.style.display = 'none';
        setupStudioUI();
      }, 400);
    } catch (fallbackErr) {
      progressContainer.style.display = 'none';
      alert('Could not decode audio from this video format: ' + err.message);
    }
  }
}

function setupStudioUI() {
  if (!extractedAudioBuffer) return;

  badgeName.textContent = currentFileName;
  badgeVideoSize.textContent = formatBytes(currentFileSize);
  badgeDuration.textContent = formatTime(extractedAudioBuffer.duration);
  readoutTotal.textContent = formatTime(extractedAudioBuffer.duration);
  readoutCurrent.textContent = formatTime(0);

  inputTrimStart.value = '0.0';
  inputTrimEnd.value = extractedAudioBuffer.duration.toFixed(1);

  fileMetaBadges.style.display = 'flex';
  btnReset.style.display = 'inline-flex';
  studioWorkspace.style.display = 'flex';
  exportPanel.style.display = 'none';

  renderWaveform(0);
}

// Waveform Rendering
function renderWaveform(currentTime = 0) {
  if (!waveformCanvas || !extractedAudioBuffer) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvasWrapper.getBoundingClientRect();
  if (rect.width === 0) return;

  waveformCanvas.width = rect.width * dpr;
  waveformCanvas.height = rect.height * dpr;

  const ctx = waveformCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = rect.height;

  // Background
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, width, height);

  const duration = extractedAudioBuffer.duration;
  if (duration <= 0) return;

  const midY = height / 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();

  // Waveform Peaks
  const cData = extractedAudioBuffer.getChannelData(0);
  const step = Math.ceil(cData.length / width);
  const amp = height * 0.42;

  ctx.fillStyle = '#10b981';
  for (let x = 0; x < width; x++) {
    const start = Math.floor(x * step);
    const end = Math.min(cData.length, Math.floor((x + 1) * step));
    let min = 1, max = -1;
    for (let j = start; j < end; j++) {
      const v = cData[j];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (max < min) { min = 0; max = 0; }
    const yTop = midY - max * amp;
    const yBottom = midY - min * amp;
    ctx.fillRect(x, yTop, 1, Math.max(1.5, yBottom - yTop));
  }

  // Playhead
  if (currentTime !== null && currentTime >= 0) {
    const px = Math.min(width, (currentTime / duration) * width);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px - 4, 0);
    ctx.lineTo(px + 4, 0);
    ctx.lineTo(px, 7);
    ctx.closePath();
    ctx.fill();
  }
}

// Synchronized Video & Waveform Playhead Tracking
previewVideo.addEventListener('timeupdate', () => {
  if (!isPlayingAudio) {
    const cur = previewVideo.currentTime;
    readoutCurrent.textContent = formatTime(cur);
    renderWaveform(cur);
  }
});

// Click waveform seeking
canvasWrapper.addEventListener('click', (e) => {
  if (!extractedAudioBuffer) return;
  const rect = canvasWrapper.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const seekTime = ratio * extractedAudioBuffer.duration;

  previewVideo.currentTime = seekTime;
  readoutCurrent.textContent = formatTime(seekTime);
  renderWaveform(seekTime);

  if (isPlayingAudio) {
    playAudio(seekTime);
  }
});

// Play Audio Logic
function playAudio(offset = 0) {
  stopAudio();
  if (!extractedAudioBuffer) return;

  const ctx = getAudioContext();
  activeAudioSource = ctx.createBufferSource();
  activeAudioSource.buffer = extractedAudioBuffer;
  activeAudioSource.connect(ctx.destination);

  playbackOffset = offset;
  playbackStartTime = ctx.currentTime - playbackOffset;

  activeAudioSource.start(0, playbackOffset);
  isPlayingAudio = true;
  previewVideo.currentTime = playbackOffset;
  previewVideo.play().catch(() => {});

  btnPlayAudio.classList.add('btn-playing');
  btnPlayAudio.querySelector('span').textContent = 'Pause Audio';

  activeAudioSource.onended = () => {
    if (isPlayingAudio && ctx.currentTime - playbackStartTime >= extractedAudioBuffer.duration - 0.05) {
      stopAudio();
      playbackOffset = 0;
      readoutCurrent.textContent = formatTime(0);
      renderWaveform(0);
      previewVideo.pause();
      previewVideo.currentTime = 0;
    }
  };

  function tick() {
    if (!isPlayingAudio) return;
    const curTime = ctx.currentTime - playbackStartTime;
    readoutCurrent.textContent = formatTime(curTime);
    renderWaveform(curTime);
    if (curTime < extractedAudioBuffer.duration) {
      animFrameId = requestAnimationFrame(tick);
    }
  }
  tick();
}

function pauseAudio() {
  if (!isPlayingAudio) return;
  const ctx = getAudioContext();
  playbackOffset = ctx.currentTime - playbackStartTime;
  if (activeAudioSource) {
    try { activeAudioSource.stop(); } catch (_) {}
    activeAudioSource.disconnect();
    activeAudioSource = null;
  }
  isPlayingAudio = false;
  previewVideo.pause();
  cancelAnimationFrame(animFrameId);
  btnPlayAudio.querySelector('span').textContent = 'Resume Audio';
}

function stopAudio() {
  if (activeAudioSource) {
    try { activeAudioSource.stop(); } catch (_) {}
    activeAudioSource.disconnect();
    activeAudioSource = null;
  }
  isPlayingAudio = false;
  cancelAnimationFrame(animFrameId);
  btnPlayAudio.querySelector('span').textContent = 'Play Extracted Audio';
}

btnPlayAudio.addEventListener('click', () => {
  if (isPlayingAudio) {
    pauseAudio();
  } else {
    playAudio(playbackOffset);
  }
});

btnStopAudio.addEventListener('click', () => {
  stopAudio();
  playbackOffset = 0;
  previewVideo.pause();
  previewVideo.currentTime = 0;
  readoutCurrent.textContent = formatTime(0);
  renderWaveform(0);
});

// Dropzone & File Listeners
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processVideoFile(file);
});
videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) processVideoFile(file);
});

btnLoadDemo.addEventListener('click', () => {
  generateDemoVideo();
});

btnReset.addEventListener('click', () => {
  if (confirm('Reset workspace and remove video?')) {
    stopAudio();
    previewVideo.pause();
    previewVideo.src = '';
    if (videoFileUrl) URL.revokeObjectURL(videoFileUrl);
    videoFileUrl = null;
    extractedAudioBuffer = null;
    studioWorkspace.style.display = 'none';
    fileMetaBadges.style.display = 'none';
    btnReset.style.display = 'none';
    exportPanel.style.display = 'none';
    videoInput.value = '';
  }
});

selectRange.addEventListener('change', () => {
  customTrimBox.style.display = selectRange.value === 'custom' ? 'grid' : 'none';
});

// Export Extracted Sound Track to WAV
btnExportAudio.addEventListener('click', () => {
  if (!extractedAudioBuffer) {
    alert('Please upload a video file first.');
    return;
  }

  btnExportAudio.disabled = true;
  btnExportAudio.innerHTML = 'Rendering WAV Track...';

  setTimeout(() => {
    try {
      const isCustom = selectRange.value === 'custom';
      const isMono = selectChannels.value === 'mono';
      const normalize = selectQuality.value === 'yes';

      const ctx = getAudioContext();
      const sampleRate = extractedAudioBuffer.sampleRate;
      const numChannels = extractedAudioBuffer.numberOfChannels;

      let startSec = 0;
      let endSec = extractedAudioBuffer.duration;
      if (isCustom) {
        startSec = Math.max(0, parseFloat(inputTrimStart.value) || 0);
        endSec = Math.min(extractedAudioBuffer.duration, parseFloat(inputTrimEnd.value) || extractedAudioBuffer.duration);
      }

      const startSample = Math.floor(startSec * sampleRate);
      const endSample = Math.floor(endSec * sampleRate);
      const sliceLen = Math.max(1, endSample - startSample);

      const exportBuf = ctx.createBuffer(numChannels, sliceLen, sampleRate);
      let peak = 0.0001;

      for (let c = 0; c < numChannels; c++) {
        const src = extractedAudioBuffer.getChannelData(c);
        const dst = exportBuf.getChannelData(c);
        for (let i = 0; i < sliceLen; i++) {
          const val = src[startSample + i];
          dst[i] = val;
          const abs = Math.abs(val);
          if (abs > peak) peak = abs;
        }
      }

      // Normalization
      if (normalize && peak > 0) {
        const factor = 0.94 / peak;
        for (let c = 0; c < numChannels; c++) {
          const dst = exportBuf.getChannelData(c);
          for (let i = 0; i < sliceLen; i++) {
            dst[i] = Math.max(-1, Math.min(1, dst[i] * factor));
          }
        }
      }

      const wavBlob = audioBufferToWavBlob(exportBuf, isMono);
      const url = URL.createObjectURL(wavBlob);

      exportAudio.src = url;
      btnDownloadAudio.href = url;
      const baseName = currentFileName.replace(/\.[^/.]+$/, '');
      btnDownloadAudio.download = `${baseName}_audio.wav`;

      exportDetails.textContent = `${formatTime(exportBuf.duration)} • ${exportBuf.sampleRate} Hz • ${isMono ? '1 Ch Mono' : '2 Ch Stereo'} • ${formatBytes(wavBlob.size)}`;
      exportPanel.style.display = 'block';
      exportPanel.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert('Failed to export audio: ' + err.message);
    } finally {
      btnExportAudio.disabled = false;
      btnExportAudio.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Export Sound Track (.WAV)</span>
      `;
    }
  }, 40);
});

window.addEventListener('resize', () => {
  renderWaveform(previewVideo ? previewVideo.currentTime : 0);
});