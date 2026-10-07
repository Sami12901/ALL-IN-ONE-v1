// Audio Merger & Sequence Stitcher - ALL IN ONE
// Client-side Web Audio API Concatenation & Crossfading

let audioCtx = null;
let tracks = []; // Array of { id, name, buffer, volume, duration, size, color }
let isPlaying = false;
let activeSource = null;
let playbackStartTime = 0;
let playbackOffset = 0;
let mergedBuffer = null;
let animFrameId = null;

const COLORS = [
  '#4e85bf', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316'
];

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const audioInput = document.getElementById('audio-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const btnClearAll = document.getElementById('btn-clear-all');
const trackCountBadge = document.getElementById('track-count-badge');
const totalTimeBadge = document.getElementById('total-time-badge');
const studioWorkarea = document.getElementById('studio-workarea');
const trackList = document.getElementById('track-list');
const trackCountText = document.getElementById('track-count-text');

const crossfadeSlider = document.getElementById('crossfade-slider');
const crossfadeVal = document.getElementById('crossfade-val');
const blendModeSelect = document.getElementById('blend-mode-select');
const gapSlider = document.getElementById('gap-slider');
const gapVal = document.getElementById('gap-val');
const outputChannelsSelect = document.getElementById('output-channels');

const timelinePanel = document.getElementById('timeline-panel');
const timelineCanvas = document.getElementById('timeline-canvas');
const timelineWrapper = document.getElementById('timeline-wrapper');
const timelineScrubTime = document.getElementById('timeline-scrub-time');
const timelineTotalTime = document.getElementById('timeline-total-time');
const timelineTickEnd = document.getElementById('timeline-tick-end');

const btnPlayMerged = document.getElementById('btn-play-merged');
const btnStopMerged = document.getElementById('btn-stop-merged');
const btnExportWav = document.getElementById('btn-export-wav');
const exportResultPanel = document.getElementById('export-result-panel');
const exportAudio = document.getElementById('export-audio');
const exportMeta = document.getElementById('export-meta');
const downloadMergedLink = document.getElementById('download-merged-link');

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
  const format = 1; // PCM
  const bitDepth = 16;
  const numSamples = buffer.length * numChannels;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF Header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave and write samples
  let offset = 44;
  const channels = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Generate synthesized demo tracks
async function generateDemoTracks() {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate || 44100;

  // Track 1: Ambient synth chord progression (3.5s)
  const dur1 = 3.5;
  const num1 = Math.floor(sampleRate * dur1);
  const buf1 = ctx.createBuffer(2, num1, sampleRate);
  const l1 = buf1.getChannelData(0);
  const r1 = buf1.getChannelData(1);
  const freqs1 = [261.63, 329.63, 392.00, 523.25]; // C major chord
  for (let i = 0; i < num1; i++) {
    const t = i / sampleRate;
    let sL = 0, sR = 0;
    freqs1.forEach((f, idx) => {
      const env = Math.sin((t / dur1) * Math.PI);
      const tone = Math.sin(2 * Math.PI * f * t) * env * 0.18;
      sL += tone * (idx % 2 === 0 ? 1 : 0.6);
      sR += tone * (idx % 2 === 1 ? 1 : 0.6);
    });
    l1[i] = sL;
    r1[i] = sR;
  }

  // Track 2: Upbeat groove rhythm (4.0s)
  const dur2 = 4.0;
  const num2 = Math.floor(sampleRate * dur2);
  const buf2 = ctx.createBuffer(2, num2, sampleRate);
  const l2 = buf2.getChannelData(0);
  const r2 = buf2.getChannelData(1);
  const freqs2 = [349.23, 440.00, 523.25, 659.25]; // F major chord
  for (let i = 0; i < num2; i++) {
    const t = i / sampleRate;
    const beat = (t * 2) % 1;
    const env = Math.exp(-beat * 4);
    const bass = Math.sin(2 * Math.PI * 110 * t) * env * 0.3;
    let s = bass;
    freqs2.forEach((f) => {
      s += Math.sin(2 * Math.PI * f * t) * 0.1 * Math.sin(t * Math.PI / dur2);
    });
    l2[i] = s;
    r2[i] = s;
  }

  // Track 3: Melodic outro chime (3.0s)
  const dur3 = 3.0;
  const num3 = Math.floor(sampleRate * dur3);
  const buf3 = ctx.createBuffer(2, num3, sampleRate);
  const l3 = buf3.getChannelData(0);
  const r3 = buf3.getChannelData(1);
  const freqs3 = [392.00, 493.88, 587.33, 783.99]; // G major chime
  for (let i = 0; i < num3; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 1.2);
    let s = 0;
    freqs3.forEach((f) => {
      s += Math.sin(2 * Math.PI * f * t) * env * 0.15;
    });
    l3[i] = s;
    r3[i] = s;
  }

  tracks = [
    { id: 'track-' + Date.now() + '-1', name: 'Demo Track 1 - Intro Pad.wav', buffer: buf1, volume: 1.0, duration: dur1, size: buf1.length * 4, color: COLORS[0] },
    { id: 'track-' + Date.now() + '-2', name: 'Demo Track 2 - Synth Groove.wav', buffer: buf2, volume: 1.0, duration: dur2, size: buf2.length * 4, color: COLORS[1] },
    { id: 'track-' + Date.now() + '-3', name: 'Demo Track 3 - Outro Chime.wav', buffer: buf3, volume: 1.0, duration: dur3, size: buf3.length * 4, color: COLORS[2] }
  ];

  updateUI();
  scheduleAutoMerge();
}

async function addAudioFile(file) {
  const ctx = getAudioContext();
  try {
    const arrayBuf = await file.arrayBuffer();
    // Use copy of arrayBuf because decodeAudioData can detach the buffer in some browsers
    const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
    const colorIndex = tracks.length % COLORS.length;
    tracks.push({
      id: 'track-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: file.name,
      buffer: decoded,
      volume: 1.0,
      duration: decoded.duration,
      size: file.size,
      color: COLORS[colorIndex]
    });
    updateUI();
    scheduleAutoMerge();
  } catch (err) {
    console.error('Failed to decode audio file:', err);
    alert(`Could not decode "${file.name}". Please ensure it is a valid uncorrupted audio file.`);
  }
}

// Calculate concatenated timeline layout
function calculateTimelineSchedule() {
  const crossfadeSec = parseFloat(crossfadeSlider.value) || 0;
  const gapSec = parseFloat(gapSlider.value) || 0;

  let currentTime = 0;
  const schedule = [];

  tracks.forEach((track, idx) => {
    const startTime = currentTime;
    const duration = track.duration;
    const endTime = startTime + duration;

    schedule.push({
      track,
      index: idx,
      startTime,
      duration,
      endTime
    });

    if (idx < tracks.length - 1) {
      if (crossfadeSec > 0) {
        // Overlap next track by crossfadeSec, but don't overlap more than track durations
        const actualCrossfade = Math.min(crossfadeSec, track.duration * 0.9, tracks[idx + 1].duration * 0.9);
        currentTime = endTime - actualCrossfade;
      } else {
        currentTime = endTime + gapSec;
      }
    } else {
      currentTime = endTime;
    }
  });

  return { schedule, totalDuration: currentTime };
}

// Merge tracks into a single AudioBuffer
function mergeAudioBuffers() {
  if (tracks.length === 0) return null;
  const ctx = getAudioContext();
  const sampleRate = tracks[0].buffer.sampleRate;
  const isMono = outputChannelsSelect.value === 'mono';
  const numChannels = isMono ? 1 : 2;

  const { schedule, totalDuration } = calculateTimelineSchedule();
  const totalSamples = Math.ceil(totalDuration * sampleRate);

  if (totalSamples <= 0) return null;

  const merged = ctx.createBuffer(numChannels, totalSamples, sampleRate);
  const outL = merged.getChannelData(0);
  const outR = numChannels > 1 ? merged.getChannelData(1) : null;

  const crossfadeSec = parseFloat(crossfadeSlider.value) || 0;
  const blendMode = blendModeSelect.value;

  schedule.forEach((item, idx) => {
    const track = item.track;
    const buf = track.buffer;
    const vol = track.volume;
    const startSample = Math.floor(item.startTime * sampleRate);
    const trackSamples = buf.length;

    const inL = buf.getChannelData(0);
    const inR = buf.numberOfChannels > 1 ? buf.getChannelData(1) : inL;

    // Crossfade in duration at start of track (if not first track and crossfade enabled)
    const hasFadeIn = idx > 0 && crossfadeSec > 0;
    const prevCrossfade = hasFadeIn ? Math.min(crossfadeSec, schedule[idx - 1].duration * 0.9, track.duration * 0.9) : 0;
    const fadeInSamples = Math.floor(prevCrossfade * sampleRate);

    // Crossfade out duration at end of track (if not last track and crossfade enabled)
    const hasFadeOut = idx < tracks.length - 1 && crossfadeSec > 0;
    const nextCrossfade = hasFadeOut ? Math.min(crossfadeSec, track.duration * 0.9, schedule[idx + 1].duration * 0.9) : 0;
    const fadeOutSamples = Math.floor(nextCrossfade * sampleRate);
    const fadeOutStartSample = trackSamples - fadeOutSamples;

    for (let s = 0; s < trackSamples; s++) {
      const destIndex = startSample + s;
      if (destIndex >= totalSamples) break;

      let gain = vol;

      // Apply fade in
      if (hasFadeIn && s < fadeInSamples && fadeInSamples > 0) {
        const factor = s / fadeInSamples;
        if (blendMode === 'equal-power') {
          gain *= Math.sin(factor * Math.PI * 0.5);
        } else if (blendMode === 'exponential') {
          gain *= Math.pow(factor, 2);
        } else {
          gain *= factor;
        }
      }

      // Apply fade out
      if (hasFadeOut && s >= fadeOutStartSample && fadeOutSamples > 0) {
        const factor = (trackSamples - 1 - s) / fadeOutSamples;
        if (blendMode === 'equal-power') {
          gain *= Math.sin(factor * Math.PI * 0.5);
        } else if (blendMode === 'exponential') {
          gain *= Math.pow(factor, 2);
        } else {
          gain *= factor;
        }
      }

      const sampleL = inL[s] * gain;
      const sampleR = inR[s] * gain;

      if (numChannels === 1) {
        outL[destIndex] += (sampleL + sampleR) * 0.5;
      } else {
        outL[destIndex] += sampleL;
        outR[destIndex] += sampleR;
      }
    }
  });

  // Clamp output samples to avoid clipping
  for (let c = 0; c < numChannels; c++) {
    const data = merged.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      if (data[i] > 1.0) data[i] = 1.0;
      else if (data[i] < -1.0) data[i] = -1.0;
    }
  }

  return merged;
}

// Render dynamic track list
function renderTrackList() {
  trackList.innerHTML = '';
  tracks.forEach((track, index) => {
    const item = document.createElement('div');
    item.className = 'track-card';
    item.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border);
      border-left: 4px solid ${track.color};
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      transition: var(--transition);
    `;

    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0;">
          <span style="font-weight: 700; font-size: 0.85rem; color: ${track.color}; background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); font-family: monospace;">#${index + 1}</span>
          <span style="font-weight: 600; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;" title="${track.name}">${track.name}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.35rem;">
          <button class="btn btn-secondary btn-step btn-move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''} title="Move Up" style="padding: 0.3rem 0.5rem;">&uarr;</button>
          <button class="btn btn-secondary btn-step btn-move-down" data-index="${index}" ${index === tracks.length - 1 ? 'disabled' : ''} title="Move Down" style="padding: 0.3rem 0.5rem;">&darr;</button>
          <button class="btn btn-secondary btn-step btn-remove" data-index="${index}" title="Remove Track" style="padding: 0.3rem 0.5rem; color: var(--error);">&times;</button>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem; color: var(--text-secondary);">
        <div style="display: flex; gap: 0.75rem; align-items: center; font-family: monospace;">
          <span>${formatTime(track.duration)}</span>
          <span>•</span>
          <span>${track.buffer.numberOfChannels === 1 ? 'Mono' : 'Stereo'}</span>
          <span>•</span>
          <span>${formatBytes(track.size)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1; max-width: 180px;">
          <span style="font-size: 0.75rem;">Vol:</span>
          <input type="range" class="range-slider track-vol-slider" data-index="${index}" min="0" max="1.5" step="0.05" value="${track.volume}" style="height: 4px;">
          <span style="font-size: 0.75rem; font-family: monospace; min-width: 2.2rem; text-align: right;">${Math.round(track.volume * 100)}%</span>
        </div>
      </div>
    `;

    // Hook listeners
    item.querySelector('.btn-move-up')?.addEventListener('click', () => {
      if (index > 0) {
        const temp = tracks[index];
        tracks[index] = tracks[index - 1];
        tracks[index - 1] = temp;
        updateUI();
        scheduleAutoMerge();
      }
    });

    item.querySelector('.btn-move-down')?.addEventListener('click', () => {
      if (index < tracks.length - 1) {
        const temp = tracks[index];
        tracks[index] = tracks[index + 1];
        tracks[index + 1] = temp;
        updateUI();
        scheduleAutoMerge();
      }
    });

    item.querySelector('.btn-remove')?.addEventListener('click', () => {
      tracks.splice(index, 1);
      updateUI();
      scheduleAutoMerge();
    });

    const volSlider = item.querySelector('.track-vol-slider');
    volSlider?.addEventListener('input', (e) => {
      track.volume = parseFloat(e.target.value);
      e.target.nextElementSibling.textContent = `${Math.round(track.volume * 100)}%`;
      scheduleAutoMerge();
    });

    trackList.appendChild(item);
  });
}

// Render Timeline Canvas
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
  ctx.fillStyle = '#070b12';
  ctx.fillRect(0, 0, width, height);

  if (tracks.length === 0) return;

  const { schedule, totalDuration } = calculateTimelineSchedule();
  if (totalDuration <= 0) return;

  const scale = width / totalDuration;

  // Draw grid ruler
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  const step = totalDuration > 30 ? 5 : 1;
  for (let s = 0; s < totalDuration; s += step) {
    const x = s * scale;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw track blocks
  schedule.forEach((item) => {
    const x = item.startTime * scale;
    const w = item.duration * scale;
    const color = item.track.color;

    // Track Block Background
    ctx.fillStyle = color + '33'; // 20% opacity
    ctx.fillRect(x, 15, w, height - 30);

    // Track Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, 15, w, height - 30);

    // Top color strip
    ctx.fillStyle = color;
    ctx.fillRect(x, 15, w, 4);

    // Track Title label
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 4, 20, w - 8, height - 40);
    ctx.clip();
    ctx.fillText(`${item.index + 1}. ${item.track.name}`, x + 8, 38);
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(formatTime(item.duration), x + 8, 52);
    ctx.restore();
  });

  // Draw Crossfade overlaps
  const crossfadeSec = parseFloat(crossfadeSlider.value) || 0;
  if (crossfadeSec > 0) {
    for (let i = 0; i < schedule.length - 1; i++) {
      const cur = schedule[i];
      const next = schedule[i + 1];
      const overlapStart = next.startTime;
      const overlapEnd = cur.endTime;
      if (overlapEnd > overlapStart) {
        const ox = overlapStart * scale;
        const ow = (overlapEnd - overlapStart) * scale;

        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fillRect(ox, 15, ow, height - 30);

        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(ox, 15, ow, height - 30);
        ctx.setLineDash([]);
      }
    }
  }

  // Draw Playhead
  if (currentTimeSec >= 0) {
    const px = Math.min(width, currentTimeSec * scale);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();

    // Playhead handle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px - 5, 0);
    ctx.lineTo(px + 5, 0);
    ctx.lineTo(px, 8);
    ctx.closePath();
    ctx.fill();
  }
}

let mergeDebounceTimeout = null;
function scheduleAutoMerge() {
  clearTimeout(mergeDebounceTimeout);
  mergeDebounceTimeout = setTimeout(() => {
    mergedBuffer = mergeAudioBuffers();
    renderTimeline(playbackOffset);
  }, 100);
}

function updateUI() {
  const hasTracks = tracks.length > 0;
  studioWorkarea.style.display = hasTracks ? 'grid' : 'none';
  timelinePanel.style.display = hasTracks ? 'block' : 'none';

  trackCountBadge.textContent = `${tracks.length} Track${tracks.length === 1 ? '' : 's'}`;
  trackCountText.textContent = tracks.length;

  const { totalDuration } = calculateTimelineSchedule();
  totalTimeBadge.textContent = formatTime(totalDuration);
  timelineTotalTime.textContent = formatTime(totalDuration);
  timelineTickEnd.textContent = formatTime(totalDuration);

  renderTrackList();
  renderTimeline(0);
}

// Playback Engine
function playMerged(fromOffset = 0) {
  stopMerged();
  if (!mergedBuffer) {
    mergedBuffer = mergeAudioBuffers();
  }
  if (!mergedBuffer) return;

  const ctx = getAudioContext();
  activeSource = ctx.createBufferSource();
  activeSource.buffer = mergedBuffer;
  activeSource.connect(ctx.destination);

  playbackOffset = fromOffset;
  playbackStartTime = ctx.currentTime - playbackOffset;

  activeSource.start(0, playbackOffset);
  isPlaying = true;

  btnPlayMerged.classList.add('btn-playing');
  btnPlayMerged.querySelector('span').textContent = 'Pause';

  activeSource.onended = () => {
    if (isPlaying && ctx.currentTime - playbackStartTime >= mergedBuffer.duration - 0.05) {
      stopMerged();
      playbackOffset = 0;
      renderTimeline(0);
      timelineScrubTime.textContent = formatTime(0);
    }
  };

  function tick() {
    if (!isPlaying) return;
    const curTime = ctx.currentTime - playbackStartTime;
    timelineScrubTime.textContent = formatTime(curTime);
    renderTimeline(curTime);
    if (curTime < mergedBuffer.duration) {
      animFrameId = requestAnimationFrame(tick);
    }
  }
  tick();
}

function pauseMerged() {
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
  btnPlayMerged.querySelector('span').textContent = 'Resume';
}

function stopMerged() {
  if (activeSource) {
    try { activeSource.stop(); } catch (_) {}
    activeSource.disconnect();
    activeSource = null;
  }
  isPlaying = false;
  cancelAnimationFrame(animFrameId);
  btnPlayMerged.querySelector('span').textContent = 'Play Merged Audio';
}

// Event Listeners
btnLoadDemo.addEventListener('click', () => {
  generateDemoTracks();
});

btnClearAll.addEventListener('click', () => {
  if (tracks.length === 0) return;
  if (confirm('Clear all tracks from the merger?')) {
    stopMerged();
    tracks = [];
    mergedBuffer = null;
    exportResultPanel.style.display = 'none';
    updateUI();
  }
});

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
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f.name));
  files.forEach(addAudioFile);
});

audioInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(addAudioFile);
  audioInput.value = '';
});

crossfadeSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value).toFixed(1);
  crossfadeVal.textContent = `${val} s`;
  const { totalDuration } = calculateTimelineSchedule();
  totalTimeBadge.textContent = formatTime(totalDuration);
  timelineTotalTime.textContent = formatTime(totalDuration);
  timelineTickEnd.textContent = formatTime(totalDuration);
  scheduleAutoMerge();
});

gapSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value).toFixed(1);
  gapVal.textContent = `${val} s`;
  const { totalDuration } = calculateTimelineSchedule();
  totalTimeBadge.textContent = formatTime(totalDuration);
  timelineTotalTime.textContent = formatTime(totalDuration);
  timelineTickEnd.textContent = formatTime(totalDuration);
  scheduleAutoMerge();
});

blendModeSelect.addEventListener('change', () => {
  scheduleAutoMerge();
});

outputChannelsSelect.addEventListener('change', () => {
  scheduleAutoMerge();
});

// Click timeline to seek
timelineWrapper.addEventListener('click', (e) => {
  const { totalDuration } = calculateTimelineSchedule();
  if (totalDuration <= 0) return;
  const rect = timelineWrapper.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const seekTime = ratio * totalDuration;
  playbackOffset = seekTime;
  timelineScrubTime.textContent = formatTime(seekTime);
  renderTimeline(seekTime);
  if (isPlaying) {
    playMerged(seekTime);
  }
});

btnPlayMerged.addEventListener('click', () => {
  if (tracks.length === 0) return;
  if (isPlaying) {
    pauseMerged();
  } else {
    playMerged(playbackOffset);
  }
});

btnStopMerged.addEventListener('click', () => {
  stopMerged();
  playbackOffset = 0;
  renderTimeline(0);
  timelineScrubTime.textContent = formatTime(0);
});

// Export WAV
btnExportWav.addEventListener('click', () => {
  if (tracks.length === 0) {
    alert('Please add at least one track to merge.');
    return;
  }

  btnExportWav.disabled = true;
  btnExportWav.innerHTML = 'Merging Audio...';

  setTimeout(() => {
    try {
      mergedBuffer = mergeAudioBuffers();
      if (!mergedBuffer) {
        throw new Error('Merge buffer failed to compute.');
      }

      const isMono = outputChannelsSelect.value === 'mono';
      const wavBlob = audioBufferToWavBlob(mergedBuffer, isMono);
      const url = URL.createObjectURL(wavBlob);

      exportAudio.src = url;
      downloadMergedLink.href = url;
      downloadMergedLink.download = `merged_${tracks.length}_tracks_${Date.now()}.wav`;

      exportMeta.textContent = `${formatTime(mergedBuffer.duration)} • ${mergedBuffer.sampleRate} Hz • ${isMono ? '1 Ch Mono' : '2 Ch Stereo'} • ${formatBytes(wavBlob.size)}`;
      exportResultPanel.style.display = 'block';
      exportResultPanel.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + err.message);
    } finally {
      btnExportWav.disabled = false;
      btnExportWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Export Merged WAV</span>
      `;
    }
  }, 50);
});

window.addEventListener('resize', () => {
  renderTimeline(playbackOffset);
});