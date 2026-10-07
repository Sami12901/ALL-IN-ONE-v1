// Podcast Intro Creator - ALL IN ONE
// Synthesized Music Themes, Voiceover Capture, Auto-Ducking & Intro WAV Mastering

let audioCtx = null;
let currentTheme = 'synthwave';
let bgAudioBuffer = null;
let voiceAudioBuffer = null;
let mixedIntroBuffer = null;

let isPlaying = false;
let activeSource = null;
let playbackStartTime = 0;
let playbackOffset = 0;
let animFrameId = null;

// Media Recorder state
let mediaRecorder = null;
let recordedChunks = [];
let recTimerInterval = null;
let recStartTime = 0;

// Beat preview state
let isPreviewingBeat = false;
let beatSource = null;

// DOM Elements
const btnQuickSample = document.getElementById('btn-quick-sample');
const btnResetIntro = document.getElementById('btn-reset-intro');
const introDurationBadge = document.getElementById('intro-duration-badge');

const btnPreviewBeat = document.getElementById('btn-preview-beat');
const themeCards = document.querySelectorAll('.theme-card');
const customBgInput = document.getElementById('custom-bg-input');

// Voice Tabs
const tabBtnMic = document.getElementById('tab-btn-mic');
const tabBtnTts = document.getElementById('tab-btn-tts');
const tabBtnUpload = document.getElementById('tab-btn-upload');
const tabContentMic = document.getElementById('tab-content-mic');
const tabContentTts = document.getElementById('tab-content-tts');
const tabContentUpload = document.getElementById('tab-content-upload');
const voiceSourceBadge = document.getElementById('voice-source-badge');

// Mic recording
const btnStartRec = document.getElementById('btn-start-rec');
const btnStopRec = document.getElementById('btn-stop-rec');
const micRecTime = document.getElementById('mic-rec-time');
const micPreviewAudio = document.getElementById('mic-preview-audio');

// TTS
const ttsTextInput = document.getElementById('tts-text-input');
const ttsVoiceSelect = document.getElementById('tts-voice-select');
const ttsSpeedSlider = document.getElementById('tts-speed-slider');
const btnTtsSpeak = document.getElementById('btn-tts-speak');
const btnTtsApply = document.getElementById('btn-tts-apply');

// Upload
const voiceUploadInput = document.getElementById('voice-upload-input');
const uploadStatusText = document.getElementById('upload-status-text');

// Mix Controls
const musicVol = document.getElementById('music-vol');
const musicVolVal = document.getElementById('music-vol-val');
const voiceVol = document.getElementById('voice-vol');
const voiceVolVal = document.getElementById('voice-vol-val');
const leadInTime = document.getElementById('lead-in-time');
const duckAmount = document.getElementById('duck-amount');
const leadOutTime = document.getElementById('lead-out-time');

// Preview & Canvas
const introCanvasWrapper = document.getElementById('intro-canvas-wrapper');
const introCanvas = document.getElementById('intro-canvas');
const readoutPlaytime = document.getElementById('readout-playtime');
const btnPlayIntro = document.getElementById('btn-play-intro');
const btnStopIntro = document.getElementById('btn-stop-intro');
const btnExportIntro = document.getElementById('btn-export-intro');

const introExportPanel = document.getElementById('intro-export-panel');
const introExportAudio = document.getElementById('intro-export-audio');
const btnDownloadIntro = document.getElementById('btn-download-intro');

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

// Convert AudioBuffer to WAV
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

// Synthesize Background Beats
function synthesizeBackgroundBeat(themeKey, targetDurationSec = 8.0) {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const numSamples = Math.ceil(sampleRate * targetDurationSec);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const outL = buffer.getChannelData(0);
  const outR = buffer.getChannelData(1);

  if (themeKey === 'synthwave') {
    // 80s Synthwave: Am - F - C - G with pulsing kick/snare and arpeggiator
    const chords = [
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [261.63, 329.63, 392.00], // C
      [196.00, 246.94, 293.66]  // G
    ];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const cIdx = Math.floor(t / 2) % chords.length;
      const chord = chords[cIdx];

      // Bass note
      const bassFreq = chord[0] / 2;
      const bassEnv = Math.exp(-(t % 0.25) * 6);
      const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassEnv * 0.22;

      // Arp 16th notes
      const arpStep = Math.floor(t * 8) % chord.length;
      const arpFreq = chord[arpStep] * 2;
      const arpEnv = Math.exp(-(t % 0.125) * 12);
      const arp = Math.sin(2 * Math.PI * arpFreq * t) * arpEnv * 0.12;

      // Kick drum on 1 and 3
      const kickBeat = (t * 2) % 1;
      const kick = Math.sin(2 * Math.PI * 65 * t) * Math.exp(-kickBeat * 14) * 0.3;

      outL[i] = bass + arp + kick;
      outR[i] = bass + arp * 0.8 + kick;
    }
  } else if (themeKey === 'lofi') {
    // Lo-Fi Chill: Dm7 - G7 - Cmaj7
    const chords = [
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [196.00, 246.94, 293.66, 349.23], // G7
      [261.63, 329.63, 392.00, 493.88]  // Cmaj7
    ];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const cIdx = Math.floor(t / 2.5) % chords.length;
      const chord = chords[cIdx];

      let chime = 0;
      chord.forEach((f) => {
        chime += Math.sin(2 * Math.PI * f * t) * 0.08;
      });
      const tremolo = 1 + 0.15 * Math.sin(2 * Math.PI * 4 * t);
      const softBeat = Math.sin(2 * Math.PI * 55 * t) * Math.exp(-(t % 1.0) * 5) * 0.18;
      const vinyl = (Math.random() * 2 - 1) * 0.004;

      outL[i] = (chime * tremolo) + softBeat + vinyl;
      outR[i] = (chime * 0.9 * tremolo) + softBeat + vinyl;
    }
  } else if (themeKey === 'corporate') {
    // Corporate Upbeat: A major - D major bright bell marimba chords
    const notes = [440, 554.37, 659.25, 880];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = (t * 4) % 1;
      const nIdx = Math.floor(t * 4) % notes.length;
      const marimba = Math.sin(2 * Math.PI * notes[nIdx] * t) * Math.exp(-beat * 7) * 0.22;
      const bass = Math.sin(2 * Math.PI * 110 * t) * Math.exp(-(t % 0.5) * 4) * 0.15;
      outL[i] = marimba + bass;
      outR[i] = marimba * 0.9 + bass;
    }
  } else {
    // Deep Ambient Tech
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const pad = Math.sin(2 * Math.PI * 185 * t) * 0.12 + Math.sin(2 * Math.PI * 277.18 * t) * 0.08;
      const sub = Math.sin(2 * Math.PI * 46.25 * t) * 0.2;
      outL[i] = pad + sub;
      outR[i] = pad * 1.1 + sub;
    }
  }

  return buffer;
}

// Synthesize realistic speech narration sound
function synthesizeSampleVoice(durationSec = 5.0) {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const numSamples = Math.ceil(sampleRate * durationSec);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const outL = buffer.getChannelData(0);
  const outR = buffer.getChannelData(1);

  // Formant vocal simulation
  const f0List = [160, 190, 220, 200, 175, 195];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const syllIndex = Math.floor(t * 2.5) % f0List.length;
    const f0 = f0List[syllIndex];
    const syllableEnv = 0.5 + 0.5 * Math.sin(2 * Math.PI * 3.5 * t);

    let v = Math.sin(2 * Math.PI * f0 * t) * 0.3;
    v += Math.sin(2 * Math.PI * (f0 * 2) * t) * 0.15;
    v += Math.sin(2 * Math.PI * (f0 * 3) * t) * 0.08;

    const sample = v * syllableEnv * Math.sin(t * Math.PI / durationSec) * 0.45;
    outL[i] = sample;
    outR[i] = sample;
  }

  return buffer;
}

// Master Mix Engine: Combines Background Beat & Voice with Ducking
function renderMixedIntro() {
  const leadIn = parseFloat(leadInTime.value) || 1.5;
  const leadOut = parseFloat(leadOutTime.value) || 2.5;
  const duckGain = parseFloat(duckAmount.value) || 0.25;
  const mVol = parseFloat(musicVol.value) || 0.75;
  const vVol = parseFloat(voiceVol.value) || 1.0;

  const voiceDur = voiceAudioBuffer ? voiceAudioBuffer.duration : 4.0;
  const totalDuration = leadIn + voiceDur + leadOut;

  // Synthesize or adapt background music to match total duration
  if (!bgAudioBuffer) {
    bgAudioBuffer = synthesizeBackgroundBeat(currentTheme, totalDuration);
  } else if (bgAudioBuffer.duration < totalDuration) {
    // Loop background buffer to cover length
    const ctx = getAudioContext();
    const rate = bgAudioBuffer.sampleRate;
    const newBuf = ctx.createBuffer(2, Math.ceil(totalDuration * rate), rate);
    const nL = newBuf.getChannelData(0);
    const nR = newBuf.getChannelData(1);
    const bL = bgAudioBuffer.getChannelData(0);
    const bR = bgAudioBuffer.numberOfChannels > 1 ? bgAudioBuffer.getChannelData(1) : bL;
    for (let i = 0; i < newBuf.length; i++) {
      const srcIdx = i % bgAudioBuffer.length;
      nL[i] = bL[srcIdx];
      nR[i] = bR[srcIdx];
    }
    bgAudioBuffer = newBuf;
  }

  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const totalSamples = Math.ceil(totalDuration * sampleRate);
  const mixed = ctx.createBuffer(2, totalSamples, sampleRate);
  const outL = mixed.getChannelData(0);
  const outR = mixed.getChannelData(1);

  const voiceStart = leadIn;
  const voiceEnd = leadIn + voiceDur;

  // Music Ducking Envelope function
  function getMusicGain(t) {
    const ramp = 0.3; // 300ms attack & release
    if (t < voiceStart - ramp) return mVol;
    if (t > voiceEnd + ramp) {
      // Fade out at tail
      const fadeStart = voiceEnd;
      const fadeDur = leadOut;
      const fadeFactor = Math.max(0, 1 - (t - fadeStart) / fadeDur);
      return mVol * fadeFactor;
    }
    if (t >= voiceStart && t <= voiceEnd) {
      return mVol * duckGain;
    }
    if (t < voiceStart) {
      const p = (t - (voiceStart - ramp)) / ramp;
      return mVol * (1 - p * (1 - duckGain));
    }
    if (t > voiceEnd) {
      const p = (t - voiceEnd) / ramp;
      return mVol * (duckGain + p * (1 - duckGain));
    }
    return mVol;
  }

  // 1. Write Background Music
  const bL = bgAudioBuffer.getChannelData(0);
  const bR = bgAudioBuffer.numberOfChannels > 1 ? bgAudioBuffer.getChannelData(1) : bL;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const gain = getMusicGain(t);
    const src = i < bgAudioBuffer.length ? i : (i % bgAudioBuffer.length);
    outL[i] = bL[src] * gain;
    outR[i] = bR[src] * gain;
  }

  // 2. Mix Voiceover
  if (voiceAudioBuffer) {
    const vL = voiceAudioBuffer.getChannelData(0);
    const vR = voiceAudioBuffer.numberOfChannels > 1 ? voiceAudioBuffer.getChannelData(1) : vL;
    const voiceStartSample = Math.floor(voiceStart * sampleRate);

    for (let i = 0; i < voiceAudioBuffer.length; i++) {
      const dest = voiceStartSample + i;
      if (dest >= totalSamples) break;
      outL[dest] += vL[i] * vVol;
      outR[dest] += vR[i] * vVol;
    }
  }

  // Normalize / Prevent clipping
  let peak = 0.0001;
  for (let i = 0; i < totalSamples; i++) {
    const aL = Math.abs(outL[i]);
    const aR = Math.abs(outR[i]);
    if (aL > peak) peak = aL;
    if (aR > peak) peak = aR;
  }
  if (peak > 0.98) {
    const scale = 0.95 / peak;
    for (let i = 0; i < totalSamples; i++) {
      outL[i] *= scale;
      outR[i] *= scale;
    }
  }

  introDurationBadge.textContent = `Intro: ${formatTime(totalDuration)}`;
  readoutPlaytime.textContent = `${formatTime(0)} / ${formatTime(totalDuration)}`;

  return mixed;
}

// Canvas Waveform Render
function renderIntroWaveform(playheadSec = 0) {
  if (!introCanvas || !mixedIntroBuffer) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = introCanvasWrapper.getBoundingClientRect();
  if (rect.width === 0) return;

  introCanvas.width = rect.width * dpr;
  introCanvas.height = rect.height * dpr;

  const ctx = introCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = rect.height;

  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, width, height);

  const midY = height / 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width, midY);
  ctx.stroke();

  // Voiceover Region Tint
  const leadIn = parseFloat(leadInTime.value) || 1.5;
  const voiceDur = voiceAudioBuffer ? voiceAudioBuffer.duration : 4.0;
  const totalDur = mixedIntroBuffer.duration;
  const vx = (leadIn / totalDur) * width;
  const vw = (voiceDur / totalDur) * width;

  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.fillRect(vx, 0, vw, height);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.strokeRect(vx, 0, vw, height);

  // Peaks
  const cData = mixedIntroBuffer.getChannelData(0);
  const step = Math.ceil(cData.length / width);
  const amp = height * 0.42;

  ctx.fillStyle = '#89aacc';
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
  if (playheadSec >= 0 && totalDur > 0) {
    const px = Math.min(width, (playheadSec / totalDur) * width);
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

// Playback Logic
function playIntro(offset = 0) {
  stopIntro();
  if (!mixedIntroBuffer) {
    mixedIntroBuffer = renderMixedIntro();
  }
  if (!mixedIntroBuffer) return;

  const ctx = getAudioContext();
  activeSource = ctx.createBufferSource();
  activeSource.buffer = mixedIntroBuffer;
  activeSource.connect(ctx.destination);

  playbackOffset = offset;
  playbackStartTime = ctx.currentTime - playbackOffset;

  activeSource.start(0, playbackOffset);
  isPlaying = true;

  btnPlayIntro.classList.add('btn-playing');
  btnPlayIntro.querySelector('span').textContent = 'Pause Preview';

  activeSource.onended = () => {
    if (isPlaying && ctx.currentTime - playbackStartTime >= mixedIntroBuffer.duration - 0.05) {
      stopIntro();
      playbackOffset = 0;
      renderIntroWaveform(0);
      readoutPlaytime.textContent = `${formatTime(0)} / ${formatTime(mixedIntroBuffer.duration)}`;
    }
  };

  function tick() {
    if (!isPlaying) return;
    const curTime = ctx.currentTime - playbackStartTime;
    readoutPlaytime.textContent = `${formatTime(curTime)} / ${formatTime(mixedIntroBuffer.duration)}`;
    renderIntroWaveform(curTime);
    if (curTime < mixedIntroBuffer.duration) {
      animFrameId = requestAnimationFrame(tick);
    }
  }
  tick();
}

function pauseIntro() {
  if (!isPlaying) return;
  const ctx = getAudioContext();
  playbackOffset = ctx.currentTime - playbackStartTime;
  if (activeSource) {
    try { activeSource.stop(); } catch (_) {}
    activeSource.disconnect();
    activeSource = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animFrameId);
  btnPlayIntro.querySelector('span').textContent = 'Resume Preview';
}

function stopIntro() {
  if (activeSource) {
    try { activeSource.stop(); } catch (_) {}
    activeSource.disconnect();
    activeSource = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animFrameId);
  btnPlayIntro.querySelector('span').textContent = 'Play Intro Preview';
}

// Quick Sample Generator
btnQuickSample.addEventListener('click', () => {
  currentTheme = 'synthwave';
  themeCards.forEach(c => {
    c.classList.toggle('active', c.dataset.theme === 'synthwave');
    c.style.borderColor = c.dataset.theme === 'synthwave' ? 'var(--accent)' : 'var(--border)';
  });
  bgAudioBuffer = synthesizeBackgroundBeat('synthwave', 8.5);
  voiceAudioBuffer = synthesizeSampleVoice(4.5);
  voiceSourceBadge.textContent = 'Synthesized Voice';

  mixedIntroBuffer = renderMixedIntro();
  renderIntroWaveform(0);
  playIntro(0);
});

// Theme Selectors
themeCards.forEach(card => {
  card.parentElement.addEventListener('click', () => {
    themeCards.forEach(c => {
      c.classList.remove('active');
      c.style.borderColor = 'var(--border)';
    });
    card.classList.add('active');
    card.style.borderColor = 'var(--accent)';
    currentTheme = card.dataset.theme;

    // Stop previous preview
    if (isPreviewingBeat && beatSource) {
      try { beatSource.stop(); } catch (_) {}
      isPreviewingBeat = false;
      btnPreviewBeat.querySelector('span').textContent = 'Preview Beat';
    }

    bgAudioBuffer = null;
    mixedIntroBuffer = renderMixedIntro();
    renderIntroWaveform(0);
  });
});

// Preview Beat Button
btnPreviewBeat.addEventListener('click', () => {
  const ctx = getAudioContext();
  if (isPreviewingBeat) {
    if (beatSource) {
      try { beatSource.stop(); } catch (_) {}
      beatSource = null;
    }
    isPreviewingBeat = false;
    btnPreviewBeat.querySelector('span').textContent = 'Preview Beat';
    return;
  }

  stopIntro();
  const sampleBuf = synthesizeBackgroundBeat(currentTheme, 6.0);
  beatSource = ctx.createBufferSource();
  beatSource.buffer = sampleBuf;
  beatSource.connect(ctx.destination);
  beatSource.start(0);
  isPreviewingBeat = true;
  btnPreviewBeat.querySelector('span').textContent = 'Stop Beat';

  beatSource.onended = () => {
    isPreviewingBeat = false;
    btnPreviewBeat.querySelector('span').textContent = 'Preview Beat';
  };
});

// Custom Background Track Upload
customBgInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const ctx = getAudioContext();
  try {
    const arrayBuffer = await file.arrayBuffer();
    bgAudioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    mixedIntroBuffer = renderMixedIntro();
    renderIntroWaveform(0);
    alert(`Loaded custom background track: ${file.name}`);
  } catch (err) {
    alert('Could not decode audio: ' + err.message);
  }
});

// Voice Tabs Switcher
tabBtnMic.addEventListener('click', () => {
  tabBtnMic.className = 'btn btn-primary';
  tabBtnTts.className = 'btn btn-secondary';
  tabBtnUpload.className = 'btn btn-secondary';
  tabContentMic.style.display = 'flex';
  tabContentTts.style.display = 'none';
  tabContentUpload.style.display = 'none';
});

tabBtnTts.addEventListener('click', () => {
  tabBtnTts.className = 'btn btn-primary';
  tabBtnMic.className = 'btn btn-secondary';
  tabBtnUpload.className = 'btn btn-secondary';
  tabContentTts.style.display = 'flex';
  tabContentMic.style.display = 'none';
  tabContentUpload.style.display = 'none';
  populateVoices();
});

tabBtnUpload.addEventListener('click', () => {
  tabBtnUpload.className = 'btn btn-primary';
  tabBtnMic.className = 'btn btn-secondary';
  tabBtnTts.className = 'btn btn-secondary';
  tabContentUpload.style.display = 'flex';
  tabContentMic.style.display = 'none';
  tabContentTts.style.display = 'none';
});

// Mic Recording Logic
btnStartRec.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      clearInterval(recTimerInterval);

      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      micPreviewAudio.src = URL.createObjectURL(blob);
      micPreviewAudio.style.display = 'block';

      const ctx = getAudioContext();
      const arrayBuf = await blob.arrayBuffer();
      try {
        voiceAudioBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));
        voiceSourceBadge.textContent = 'Mic Recording';
        mixedIntroBuffer = renderMixedIntro();
        renderIntroWaveform(0);
      } catch (err) {
        console.warn('Decode webm fallback', err);
      }
    };

    mediaRecorder.start(100);
    recStartTime = Date.now();
    btnStartRec.disabled = true;
    btnStopRec.disabled = false;

    recTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recStartTime) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      micRecTime.textContent = `${m}:${s}`;
    }, 250);
  } catch (err) {
    alert('Microphone access denied or unavailable: ' + err.message);
  }
});

btnStopRec.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    btnStartRec.disabled = false;
    btnStopRec.disabled = true;
  }
});

// TTS Logic
function populateVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  ttsVoiceSelect.innerHTML = '';
  voices.forEach((v, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${v.name} (${v.lang})`;
    if (v.lang.startsWith('en')) opt.selected = true;
    ttsVoiceSelect.appendChild(opt);
  });
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

btnTtsSpeak.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) {
    alert('SpeechSynthesis is not supported in this browser.');
    return;
  }
  const text = ttsTextInput.value.trim();
  if (!text) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  if (voices[ttsVoiceSelect.value]) utter.voice = voices[ttsVoiceSelect.value];
  utter.rate = parseFloat(ttsSpeedSlider.value) || 1.0;
  speechSynthesis.speak(utter);
});

btnTtsApply.addEventListener('click', () => {
  const text = ttsTextInput.value.trim();
  if (!text) return;
  // Estimate length: ~3 words per second
  const words = text.split(/\s+/).length;
  const estimatedSeconds = Math.max(2.5, words / 2.8);
  voiceAudioBuffer = synthesizeSampleVoice(estimatedSeconds);
  voiceSourceBadge.textContent = 'TTS Script';
  mixedIntroBuffer = renderMixedIntro();
  renderIntroWaveform(0);
  alert(`Applied text script voice (${estimatedSeconds.toFixed(1)}s) to intro.`);
});

// Voice Upload Input
voiceUploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const ctx = getAudioContext();
  try {
    const arrayBuffer = await file.arrayBuffer();
    voiceAudioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    voiceSourceBadge.textContent = file.name;
    uploadStatusText.textContent = `Loaded: ${file.name} (${formatTime(voiceAudioBuffer.duration)})`;
    mixedIntroBuffer = renderMixedIntro();
    renderIntroWaveform(0);
  } catch (err) {
    alert('Failed to decode speech file: ' + err.message);
  }
});

// Mixing sliders
musicVol.addEventListener('input', (e) => {
  musicVolVal.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
  mixedIntroBuffer = renderMixedIntro();
  renderIntroWaveform(playbackOffset);
});
voiceVol.addEventListener('input', (e) => {
  voiceVolVal.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
  mixedIntroBuffer = renderMixedIntro();
  renderIntroWaveform(playbackOffset);
});
leadInTime.addEventListener('change', () => {
  mixedIntroBuffer = renderMixedIntro();
  renderIntroWaveform(playbackOffset);
});
duckAmount.addEventListener('change', () => {
  mixedIntroBuffer = renderMixedIntro();
  renderIntroWaveform(playbackOffset);
});
leadOutTime.addEventListener('change', () => {
  mixedIntroBuffer = renderMixedIntro();
  renderIntroWaveform(playbackOffset);
});

// Click waveform seeking
introCanvasWrapper.addEventListener('click', (e) => {
  if (!mixedIntroBuffer) return;
  const rect = introCanvasWrapper.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const seekTime = ratio * mixedIntroBuffer.duration;
  playbackOffset = seekTime;
  readoutPlaytime.textContent = `${formatTime(seekTime)} / ${formatTime(mixedIntroBuffer.duration)}`;
  renderIntroWaveform(seekTime);
  if (isPlaying) {
    playIntro(seekTime);
  }
});

btnPlayIntro.addEventListener('click', () => {
  if (isPlaying) {
    pauseIntro();
  } else {
    playIntro(playbackOffset);
  }
});

btnStopIntro.addEventListener('click', () => {
  stopIntro();
  playbackOffset = 0;
  if (mixedIntroBuffer) {
    readoutPlaytime.textContent = `${formatTime(0)} / ${formatTime(mixedIntroBuffer.duration)}`;
    renderIntroWaveform(0);
  }
});

btnResetIntro.addEventListener('click', () => {
  if (confirm('Reset intro workspace?')) {
    stopIntro();
    voiceAudioBuffer = null;
    bgAudioBuffer = null;
    mixedIntroBuffer = null;
    introExportPanel.style.display = 'none';
    voiceSourceBadge.textContent = 'Microphone / File';
    introDurationBadge.textContent = 'Intro: Ready';
    readoutPlaytime.textContent = '00:00.000';
    if (introCanvas) {
      const ctx = introCanvas.getContext('2d');
      ctx.clearRect(0, 0, introCanvas.width, introCanvas.height);
    }
  }
});

// Export Intro WAV
btnExportIntro.addEventListener('click', () => {
  if (!mixedIntroBuffer) {
    mixedIntroBuffer = renderMixedIntro();
  }
  if (!mixedIntroBuffer) {
    alert('Please create or generate an intro first.');
    return;
  }

  btnExportIntro.disabled = true;
  btnExportIntro.innerHTML = 'Exporting Intro...';

  setTimeout(() => {
    try {
      mixedIntroBuffer = renderMixedIntro();
      const wavBlob = audioBufferToWavBlob(mixedIntroBuffer);
      const url = URL.createObjectURL(wavBlob);

      introExportAudio.src = url;
      btnDownloadIntro.href = url;
      btnDownloadIntro.download = `podcast_intro_${currentTheme}_${Date.now()}.wav`;

      introExportPanel.style.display = 'block';
      introExportPanel.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      btnExportIntro.disabled = false;
      btnExportIntro.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <span>Export WAV</span>
      `;
    }
  }, 40);
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  populateVoices();
  mixedIntroBuffer = renderMixedIntro();
  renderIntroWaveform(0);
});

window.addEventListener('resize', () => {
  renderIntroWaveform(playbackOffset);
});