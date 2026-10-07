// Podcast Arrangement Studio & Multi-Track Mixer - ALL IN ONE
// Client-side Web Audio API Multi-Track Sequencing, Ducking & WAV Mastering

let audioCtx = null;

const tracks = {
  intro: {
    name: 'Intro Music',
    buffer: null,
    volume: 0.85,
    offset: 0.0,
    fadeOut: 1.5,
    muted: false,
    color: '#06b6d4'
  },
  voice: {
    name: 'Voiceover',
    buffer: null,
    volume: 1.0,
    offset: 1.5,
    trimStart: 0.0,
    muted: false,
    color: '#10b981'
  },
  outro: {
    name: 'Outro Music',
    buffer: null,
    volume: 0.8,
    offset: 6.0,
    fadeIn: 1.0,
    muted: false,
    color: '#8b5cf6'
  }
};

let mixedBuffer = null;
let isPlaying = false;
let activeSource = null;
let playbackStartTime = 0;
let playbackOffset = 0;
let animFrameId = null;

// DOM Elements
const btnLoadDemo = document.getElementById('btn-load-demo');
const btnClearProject = document.getElementById('btn-clear-project');
const episodeDurationBadge = document.getElementById('episode-duration-badge');

const timelineWrapper = document.getElementById('timeline-wrapper');
const timelineCanvas = document.getElementById('timeline-canvas');
const timelineCurrentTime = document.getElementById('timeline-current-time');
const timelineTotalTime = document.getElementById('timeline-total-time');
const timelineEndTick = document.getElementById('timeline-end-tick');

const btnPlayEpisode = document.getElementById('btn-play-episode');
const btnStopEpisode = document.getElementById('btn-stop-episode');
const checkAutoDuck = document.getElementById('check-auto-duck');
const btnExportEpisode = document.getElementById('btn-export-episode');

const exportPanel = document.getElementById('export-panel');
const exportDetails = document.getElementById('export-details');
const exportAudioPlayer = document.getElementById('export-audio-player');
const downloadEpisodeLink = document.getElementById('download-episode-link');

// Track DOM Inputs
const fileIntro = document.getElementById('file-intro');
const introStatus = document.getElementById('intro-status');
const introVol = document.getElementById('intro-vol');
const introVolVal = document.getElementById('intro-vol-val');
const introOffset = document.getElementById('intro-offset');
const introFadeout = document.getElementById('intro-fadeout');
const introMute = document.getElementById('intro-mute');
const introTimeInfo = document.getElementById('intro-time-info');

const fileVoice = document.getElementById('file-voice');
const voiceStatus = document.getElementById('voice-status');
const voiceVol = document.getElementById('voice-vol');
const voiceVolVal = document.getElementById('voice-vol-val');
const voiceOffset = document.getElementById('voice-offset');
const voiceTrimStart = document.getElementById('voice-trim-start');
const voiceMute = document.getElementById('voice-mute');
const voiceTimeInfo = document.getElementById('voice-time-info');

const fileOutro = document.getElementById('file-outro');
const outroStatus = document.getElementById('outro-status');
const outroVol = document.getElementById('outro-vol');
const outroVolVal = document.getElementById('outro-vol-val');
const outroOffset = document.getElementById('outro-offset');
const outroFadein = document.getElementById('outro-fadein');
const outroMute = document.getElementById('outro-mute');
const outroTimeInfo = document.getElementById('outro-time-info');

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

// Synthesize Sample Podcast Episode
async function loadSamplePodcastSession() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;

  // 1. Intro Music (4.5s energetic chime beat)
  const introDur = 4.5;
  const introBuf = ctx.createBuffer(2, Math.floor(sampleRate * introDur), sampleRate);
  const inL = introBuf.getChannelData(0);
  const inR = introBuf.getChannelData(1);
  const introChords = [329.63, 392.00, 493.88, 587.33]; // Em7
  for (let i = 0; i < introBuf.length; i++) {
    const t = i / sampleRate;
    let s = 0;
    introChords.forEach((f, idx) => {
      const beat = (t * 2 + idx * 0.25) % 1;
      s += Math.sin(2 * Math.PI * f * t) * Math.exp(-beat * 4) * 0.18;
    });
    const kick = Math.sin(2 * Math.PI * 65 * t) * Math.exp(-(t % 0.5) * 8) * 0.3;
    inL[i] = s + kick;
    inR[i] = s * 0.9 + kick;
  }
  tracks.intro.buffer = introBuf;
  tracks.intro.offset = 0.0;
  tracks.intro.fadeOut = 1.8;

  // 2. Voiceover Speech Narration (6.5s vocal harmonics)
  const voiceDur = 6.5;
  const voiceBuf = ctx.createBuffer(2, Math.floor(sampleRate * voiceDur), sampleRate);
  const vL = voiceBuf.getChannelData(0);
  const vR = voiceBuf.getChannelData(1);
  const voiceVowels = [180, 220, 260, 240, 200];
  for (let i = 0; i < voiceBuf.length; i++) {
    const t = i / sampleRate;
    const vIdx = Math.floor(t * 1.5) % voiceVowels.length;
    const f0 = voiceVowels[vIdx];
    // Formant simulation for speech voiceover
    let speech = Math.sin(2 * Math.PI * f0 * t) * 0.25;
    speech += Math.sin(2 * Math.PI * (f0 * 2.5) * t) * 0.15;
    speech += Math.sin(2 * Math.PI * (f0 * 4) * t) * 0.08;
    // Modulation envelope
    const syllEnv = 0.6 + 0.4 * Math.sin(2 * Math.PI * 3.5 * t);
    const speechSample = speech * syllEnv * 0.4;
    vL[i] = speechSample;
    vR[i] = speechSample;
  }
  tracks.voice.buffer = voiceBuf;
  tracks.voice.offset = 2.0; // Voice enters at 2s while intro ducks
  tracks.voice.trimStart = 0.0;

  // 3. Outro Theme (4.0s chill synth outro)
  const outroDur = 4.0;
  const outroBuf = ctx.createBuffer(2, Math.floor(sampleRate * outroDur), sampleRate);
  const outL = outroBuf.getChannelData(0);
  const outR = outroBuf.getChannelData(1);
  for (let i = 0; i < outroBuf.length; i++) {
    const t = i / sampleRate;
    const outroEnv = Math.sin((t / outroDur) * Math.PI);
    const chord = Math.sin(2 * Math.PI * 440 * t) * 0.15 + Math.sin(2 * Math.PI * 554.37 * t) * 0.15;
    outL[i] = chord * outroEnv;
    outR[i] = chord * outroEnv;
  }
  tracks.outro.buffer = outroBuf;
  tracks.outro.offset = 7.0; // Outro starts near voice end
  tracks.outro.fadeIn = 1.2;

  updateTrackCards();
  recalculateTotalDuration();
  renderTimeline(0);
  scheduleAutoMix();
}

function updateTrackCards() {
  if (tracks.intro.buffer) {
    introStatus.textContent = `${formatTime(tracks.intro.buffer.duration)} loaded`;
    introStatus.style.color = '#06b6d4';
    introTimeInfo.textContent = `${tracks.intro.buffer.duration.toFixed(1)}s`;
  }
  if (tracks.voice.buffer) {
    voiceStatus.textContent = `${formatTime(tracks.voice.buffer.duration)} loaded`;
    voiceStatus.style.color = '#10b981';
    voiceTimeInfo.textContent = `${tracks.voice.buffer.duration.toFixed(1)}s`;
  }
  if (tracks.outro.buffer) {
    outroStatus.textContent = `${formatTime(tracks.outro.buffer.duration)} loaded`;
    outroStatus.style.color = '#8b5cf6';
    outroTimeInfo.textContent = `${tracks.outro.buffer.duration.toFixed(1)}s`;
  }

  introVol.value = tracks.intro.volume;
  introVolVal.textContent = `${Math.round(tracks.intro.volume * 100)}%`;
  introOffset.value = tracks.intro.offset;
  introFadeout.value = tracks.intro.fadeOut;
  introMute.checked = tracks.intro.muted;

  voiceVol.value = tracks.voice.volume;
  voiceVolVal.textContent = `${Math.round(tracks.voice.volume * 100)}%`;
  voiceOffset.value = tracks.voice.offset;
  voiceTrimStart.value = tracks.voice.trimStart;
  voiceMute.checked = tracks.voice.muted;

  outroVol.value = tracks.outro.volume;
  outroVolVal.textContent = `${Math.round(tracks.outro.volume * 100)}%`;
  outroOffset.value = tracks.outro.offset;
  outroFadein.value = tracks.outro.fadeIn;
  outroMute.checked = tracks.outro.muted;
}

function calculateEpisodeEnd() {
  let maxEnd = 0;
  if (tracks.intro.buffer) {
    maxEnd = Math.max(maxEnd, tracks.intro.offset + tracks.intro.buffer.duration);
  }
  if (tracks.voice.buffer) {
    const dur = Math.max(0, tracks.voice.buffer.duration - tracks.voice.trimStart);
    maxEnd = Math.max(maxEnd, tracks.voice.offset + dur);
  }
  if (tracks.outro.buffer) {
    maxEnd = Math.max(maxEnd, tracks.outro.offset + tracks.outro.buffer.duration);
  }
  return maxEnd;
}

function recalculateTotalDuration() {
  const total = calculateEpisodeEnd();
  episodeDurationBadge.textContent = `Total Duration: ${formatTime(total)}`;
  timelineTotalTime.textContent = formatTime(total);
  timelineEndTick.textContent = formatTime(total);
}

// Multi-Track Audio Mixing Engine
function mixPodcastAudio() {
  const totalDur = calculateEpisodeEnd();
  if (totalDur <= 0) return null;

  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;
  const totalSamples = Math.ceil(totalDur * sampleRate);
  const mixed = ctx.createBuffer(2, totalSamples, sampleRate);
  const outL = mixed.getChannelData(0);
  const outR = mixed.getChannelData(1);

  const autoDuck = checkAutoDuck.checked;

  // Voiceover active time interval
  const voiceHasAudio = tracks.voice.buffer && !tracks.voice.muted;
  const voiceStart = tracks.voice.offset;
  const voiceDur = voiceHasAudio ? Math.max(0, tracks.voice.buffer.duration - tracks.voice.trimStart) : 0;
  const voiceEnd = voiceStart + voiceDur;

  // Ducking multiplier function for music
  function getDuckingGainAt(timeSec) {
    if (!autoDuck || !voiceHasAudio || voiceDur <= 0) return 1.0;
    const ramp = 0.35; // 350ms duck attack & release
    if (timeSec < voiceStart - ramp || timeSec > voiceEnd + ramp) {
      return 1.0;
    }
    if (timeSec >= voiceStart && timeSec <= voiceEnd) {
      return 0.28; // Ducked down to 28%
    }
    if (timeSec < voiceStart) {
      const t = (timeSec - (voiceStart - ramp)) / ramp;
      return 1.0 - t * (1.0 - 0.28);
    }
    if (timeSec > voiceEnd) {
      const t = (timeSec - voiceEnd) / ramp;
      return 0.28 + t * (1.0 - 0.28);
    }
    return 1.0;
  }

  // 1. Render Intro Track
  if (tracks.intro.buffer && !tracks.intro.muted) {
    const buf = tracks.intro.buffer;
    const startSample = Math.floor(tracks.intro.offset * sampleRate);
    const fadeOutSec = tracks.intro.fadeOut;
    const fadeOutSamples = Math.floor(fadeOutSec * sampleRate);
    const fadeOutStart = buf.length - fadeOutSamples;
    const inL = buf.getChannelData(0);
    const inR = buf.numberOfChannels > 1 ? buf.getChannelData(1) : inL;

    for (let i = 0; i < buf.length; i++) {
      const dest = startSample + i;
      if (dest >= totalSamples) break;
      const t = dest / sampleRate;
      let gain = tracks.intro.volume * getDuckingGainAt(t);

      if (fadeOutSamples > 0 && i >= fadeOutStart) {
        gain *= Math.max(0, (buf.length - 1 - i) / fadeOutSamples);
      }

      outL[dest] += inL[i] * gain;
      outR[dest] += inR[i] * gain;
    }
  }

  // 2. Render Voiceover Track
  if (voiceHasAudio) {
    const buf = tracks.voice.buffer;
    const trimSamples = Math.floor(tracks.voice.trimStart * sampleRate);
    const startSample = Math.floor(tracks.voice.offset * sampleRate);
    const inL = buf.getChannelData(0);
    const inR = buf.numberOfChannels > 1 ? buf.getChannelData(1) : inL;
    const playLength = Math.max(0, buf.length - trimSamples);

    for (let i = 0; i < playLength; i++) {
      const dest = startSample + i;
      if (dest >= totalSamples) break;
      const gain = tracks.voice.volume;
      const srcIdx = trimSamples + i;

      outL[dest] += inL[srcIdx] * gain;
      outR[dest] += inR[srcIdx] * gain;
    }
  }

  // 3. Render Outro Track
  if (tracks.outro.buffer && !tracks.outro.muted) {
    const buf = tracks.outro.buffer;
    const startSample = Math.floor(tracks.outro.offset * sampleRate);
    const fadeInSec = tracks.outro.fadeIn;
    const fadeInSamples = Math.floor(fadeInSec * sampleRate);
    const inL = buf.getChannelData(0);
    const inR = buf.numberOfChannels > 1 ? buf.getChannelData(1) : inL;

    for (let i = 0; i < buf.length; i++) {
      const dest = startSample + i;
      if (dest >= totalSamples) break;
      const t = dest / sampleRate;
      let gain = tracks.outro.volume * getDuckingGainAt(t);

      if (fadeInSamples > 0 && i < fadeInSamples) {
        gain *= (i / fadeInSamples);
      }

      outL[dest] += inL[i] * gain;
      outR[dest] += inR[i] * gain;
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
    const factor = 0.96 / peak;
    for (let i = 0; i < totalSamples; i++) {
      outL[i] *= factor;
      outR[i] *= factor;
    }
  }

  return mixed;
}

// Render Multi-Track Timeline Canvas
function renderTimeline(currentTimeSec = 0) {
  if (!timelineCanvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = timelineWrapper.getBoundingClientRect();
  if (rect.width === 0) return;

  timelineCanvas.width = rect.width * dpr;
  timelineCanvas.height = rect.height * dpr;

  const ctx = timelineCanvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = rect.height;

  // Background
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, width, height);

  const totalDur = Math.max(1, calculateEpisodeEnd());
  const scale = width / totalDur;

  // 3 Track lanes
  const laneHeight = (height - 20) / 3;

  const lanes = [
    { key: 'intro', track: tracks.intro, label: 'Intro Music', y: 15 },
    { key: 'voice', track: tracks.voice, label: 'Voiceover Speech', y: 15 + laneHeight },
    { key: 'outro', track: tracks.outro, label: 'Outro Music', y: 15 + laneHeight * 2 }
  ];

  // Draw lane grid & labels
  lanes.forEach((lane, idx) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, lane.y + laneHeight - 1);
    ctx.lineTo(width, lane.y + laneHeight - 1);
    ctx.stroke();

    // Lane background highlight
    if (idx % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fillRect(0, lane.y, width, laneHeight - 2);
    }
  });

  // Time grid vertical ticks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  const step = totalDur > 20 ? 5 : 1;
  for (let s = 0; s <= totalDur; s += step) {
    const x = s * scale;
    ctx.beginPath();
    ctx.moveTo(x, 15);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw Track Audio Blocks
  lanes.forEach(lane => {
    const t = lane.track;
    if (!t.buffer) return;

    let dur = t.buffer.duration;
    if (lane.key === 'voice') {
      dur = Math.max(0, dur - t.trimStart);
    }

    const x = t.offset * scale;
    const w = dur * scale;
    const y = lane.y + 3;
    const h = laneHeight - 6;

    // Block Fill
    ctx.fillStyle = t.muted ? 'rgba(100, 100, 100, 0.2)' : t.color + '33';
    ctx.fillRect(x, y, w, h);

    // Block Border
    ctx.strokeStyle = t.muted ? 'rgba(150, 150, 150, 0.4)' : t.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Color header bar
    ctx.fillStyle = t.color;
    ctx.fillRect(x, y, w, 3);

    // Block Label
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, y, Math.max(0, w - 4), h);
    ctx.clip();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillText(lane.label + (t.muted ? ' (Muted)' : ''), x + 6, y + 16);
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`${formatTime(dur)} (vol: ${Math.round(t.volume * 100)}%)`, x + 6, y + 28);
    ctx.restore();
  });

  // Draw Voice Ducking indicator highlight
  if (checkAutoDuck.checked && tracks.voice.buffer && !tracks.voice.muted) {
    const vx = tracks.voice.offset * scale;
    const vw = Math.max(0, tracks.voice.buffer.duration - tracks.voice.trimStart) * scale;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fillRect(vx, 15, vw, height - 15);
  }

  // Playhead scrubber
  if (currentTimeSec >= 0) {
    const px = Math.min(width, currentTimeSec * scale);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px - 5, 0);
    ctx.lineTo(px + 5, 0);
    ctx.lineTo(px, 8);
    ctx.closePath();
    ctx.fill();
  }
}

let mixDebounceTimer = null;
function scheduleAutoMix() {
  clearTimeout(mixDebounceTimer);
  mixDebounceTimer = setTimeout(() => {
    mixedBuffer = mixPodcastAudio();
  }, 100);
}

// Episode Playback
function playEpisode(offset = 0) {
  stopEpisode();
  if (!mixedBuffer) {
    mixedBuffer = mixPodcastAudio();
  }
  if (!mixedBuffer) return;

  const ctx = getAudioContext();
  activeSource = ctx.createBufferSource();
  activeSource.buffer = mixedBuffer;
  activeSource.connect(ctx.destination);

  playbackOffset = offset;
  playbackStartTime = ctx.currentTime - playbackOffset;

  activeSource.start(0, playbackOffset);
  isPlaying = true;

  btnPlayEpisode.classList.add('btn-playing');
  btnPlayEpisode.querySelector('span').textContent = 'Pause Preview';

  activeSource.onended = () => {
    if (isPlaying && ctx.currentTime - playbackStartTime >= mixedBuffer.duration - 0.05) {
      stopEpisode();
      playbackOffset = 0;
      renderTimeline(0);
      timelineCurrentTime.textContent = formatTime(0);
    }
  };

  function update() {
    if (!isPlaying) return;
    const curTime = ctx.currentTime - playbackStartTime;
    timelineCurrentTime.textContent = formatTime(curTime);
    renderTimeline(curTime);
    if (curTime < mixedBuffer.duration) {
      animFrameId = requestAnimationFrame(update);
    }
  }
  update();
}

function pauseEpisode() {
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
  btnPlayEpisode.querySelector('span').textContent = 'Resume Preview';
}

function stopEpisode() {
  if (activeSource) {
    try { activeSource.stop(); } catch (_) {}
    activeSource.disconnect();
    activeSource = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animFrameId);
  btnPlayEpisode.querySelector('span').textContent = 'Play Episode Preview';
}

// Upload handlers for the 3 individual tracks
async function handleTrackUpload(file, trackKey) {
  const ctx = getAudioContext();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    tracks[trackKey].buffer = decoded;
    updateTrackCards();
    recalculateTotalDuration();
    renderTimeline(playbackOffset);
    scheduleAutoMix();
  } catch (err) {
    console.error(`Failed to decode track ${trackKey}:`, err);
    alert(`Could not decode audio: ${err.message}`);
  }
}

fileIntro.addEventListener('change', (e) => {
  if (e.target.files[0]) handleTrackUpload(e.target.files[0], 'intro');
});
fileVoice.addEventListener('change', (e) => {
  if (e.target.files[0]) handleTrackUpload(e.target.files[0], 'voice');
});
fileOutro.addEventListener('change', (e) => {
  if (e.target.files[0]) handleTrackUpload(e.target.files[0], 'outro');
});

// Intro track controls
introVol.addEventListener('input', (e) => {
  tracks.intro.volume = parseFloat(e.target.value);
  introVolVal.textContent = `${Math.round(tracks.intro.volume * 100)}%`;
  scheduleAutoMix();
});
introOffset.addEventListener('input', (e) => {
  tracks.intro.offset = Math.max(0, parseFloat(e.target.value) || 0);
  recalculateTotalDuration();
  renderTimeline(playbackOffset);
  scheduleAutoMix();
});
introFadeout.addEventListener('input', (e) => {
  tracks.intro.fadeOut = Math.max(0, parseFloat(e.target.value) || 0);
  scheduleAutoMix();
});
introMute.addEventListener('change', (e) => {
  tracks.intro.muted = e.target.checked;
  renderTimeline(playbackOffset);
  scheduleAutoMix();
});

// Voice track controls
voiceVol.addEventListener('input', (e) => {
  tracks.voice.volume = parseFloat(e.target.value);
  voiceVolVal.textContent = `${Math.round(tracks.voice.volume * 100)}%`;
  scheduleAutoMix();
});
voiceOffset.addEventListener('input', (e) => {
  tracks.voice.offset = Math.max(0, parseFloat(e.target.value) || 0);
  recalculateTotalDuration();
  renderTimeline(playbackOffset);
  scheduleAutoMix();
});
voiceTrimStart.addEventListener('input', (e) => {
  tracks.voice.trimStart = Math.max(0, parseFloat(e.target.value) || 0);
  recalculateTotalDuration();
  renderTimeline(playbackOffset);
  scheduleAutoMix();
});
voiceMute.addEventListener('change', (e) => {
  tracks.voice.muted = e.target.checked;
  renderTimeline(playbackOffset);
  scheduleAutoMix();
});

// Outro track controls
outroVol.addEventListener('input', (e) => {
  tracks.outro.volume = parseFloat(e.target.value);
  outroVolVal.textContent = `${Math.round(tracks.outro.volume * 100)}%`;
  scheduleAutoMix();
});
outroOffset.addEventListener('input', (e) => {
  tracks.outro.offset = Math.max(0, parseFloat(e.target.value) || 0);
  recalculateTotalDuration();
  renderTimeline(playbackOffset);
  scheduleAutoMix();
});
outroFadein.addEventListener('input', (e) => {
  tracks.outro.fadeIn = Math.max(0, parseFloat(e.target.value) || 0);
  scheduleAutoMix();
});
outroMute.addEventListener('change', (e) => {
  tracks.outro.muted = e.target.checked;
  renderTimeline(playbackOffset);
  scheduleAutoMix();
});

checkAutoDuck.addEventListener('change', () => {
  renderTimeline(playbackOffset);
  scheduleAutoMix();
});

// Click timeline to scrub
timelineWrapper.addEventListener('click', (e) => {
  const total = calculateEpisodeEnd();
  if (total <= 0) return;
  const rect = timelineWrapper.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const seekTime = ratio * total;
  playbackOffset = seekTime;
  timelineCurrentTime.textContent = formatTime(seekTime);
  renderTimeline(seekTime);
  if (isPlaying) {
    playEpisode(seekTime);
  }
});

btnPlayEpisode.addEventListener('click', () => {
  if (calculateEpisodeEnd() <= 0) {
    alert('Please upload or load sample podcast tracks first.');
    return;
  }
  if (isPlaying) {
    pauseEpisode();
  } else {
    playEpisode(playbackOffset);
  }
});

btnStopEpisode.addEventListener('click', () => {
  stopEpisode();
  playbackOffset = 0;
  timelineCurrentTime.textContent = formatTime(0);
  renderTimeline(0);
});

btnLoadDemo.addEventListener('click', () => {
  loadSamplePodcastSession();
});

btnClearProject.addEventListener('click', () => {
  if (confirm('Clear all podcast tracks from workspace?')) {
    stopEpisode();
    tracks.intro.buffer = null;
    tracks.voice.buffer = null;
    tracks.outro.buffer = null;
    mixedBuffer = null;
    introStatus.textContent = 'No audio'; introStatus.style.color = '';
    voiceStatus.textContent = 'No audio'; voiceStatus.style.color = '';
    outroStatus.textContent = 'No audio'; outroStatus.style.color = '';
    recalculateTotalDuration();
    renderTimeline(0);
    exportPanel.style.display = 'none';
  }
});

// Export Mastered Episode WAV
btnExportEpisode.addEventListener('click', () => {
  if (calculateEpisodeEnd() <= 0) {
    alert('Please add at least one track to export.');
    return;
  }

  btnExportEpisode.disabled = true;
  btnExportEpisode.innerHTML = 'Rendering Master Episode...';

  setTimeout(() => {
    try {
      mixedBuffer = mixPodcastAudio();
      if (!mixedBuffer) throw new Error('Audio mix could not be rendered.');

      const wavBlob = audioBufferToWavBlob(mixedBuffer);
      const url = URL.createObjectURL(wavBlob);

      exportAudioPlayer.src = url;
      downloadEpisodeLink.href = url;
      downloadEpisodeLink.download = `podcast_episode_${Date.now()}.wav`;

      exportDetails.textContent = `${formatTime(mixedBuffer.duration)} • ${mixedBuffer.sampleRate} Hz • 2-Ch Stereo • ${formatBytes(wavBlob.size)}`;
      exportPanel.style.display = 'block';
      exportPanel.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + err.message);
    } finally {
      btnExportEpisode.disabled = false;
      btnExportEpisode.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        <span>Export Master Episode (.WAV)</span>
      `;
    }
  }, 40);
});

window.addEventListener('resize', () => {
  renderTimeline(playbackOffset);
});