// AI Video & Audio Dubbing Studio - Engine

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

const DUB_PROJECTS = {
  keynote: {
    lang: 'es',
    totalDuration: 13.5,
    cues: [
      { start: 0.5, end: 4.2, orig: "Good morning everyone. Today we are launching our next generation neural processor.", dub: "Buenos días a todos. Hoy presentamos nuestro procesador neuronal de última generación." },
      { start: 4.8, end: 8.8, orig: "It is twice as fast and consumes forty percent less battery life.", dub: "Es el doble de rápido y consume un cuarenta por ciento menos de batería." },
      { start: 9.3, end: 13.0, orig: "Available across sixty countries starting this Friday.", dub: "Disponible en más de sesenta países a partir de este viernes." }
    ]
  },
  travel: {
    lang: 'fr',
    totalDuration: 13.0,
    cues: [
      { start: 0.5, end: 4.0, orig: "Look at the extraordinary turquoise clarity of this alpine lake.", dub: "Regardez la clarté turquoise extraordinaire de ce lac alpin." },
      { start: 4.6, end: 8.4, orig: "We hiked for over four hours to reach this breathtaking summit view.", dub: "Nous avons marché pendant plus de quatre heures pour atteindre ce sommet." },
      { start: 8.9, end: 12.5, orig: "Definitely add this secret trail to your travel bucket list.", dub: "Ajoutez absolument ce sentier secret à votre liste de voyages." }
    ]
  },
  trailer: {
    lang: 'ar',
    totalDuration: 13.0,
    cues: [
      { start: 0.5, end: 4.0, orig: "In a world shattered by shadows, one hope remains.", dub: "في عالم مزقته الظلال، يبقى أمل واحد." },
      { start: 4.6, end: 8.4, orig: "The ancient guardians have awakened to reclaim their realm.", dub: "لقد استيقظ الحراس القدامى لاستعادة مملكتهم." },
      { start: 9.0, end: 12.8, orig: "Coming to theaters worldwide this December.", dub: "قادم إلى صالات السينما حول العالم في ديسمبر القادم." }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let isPlaying = false;
  let playbackStartTime = 0;
  let animId = null;
  let triggeredCues = new Set();
  let voices = [];
  let foleyGainNode = null;
  let foleyOscs = [];

  // DOM
  const videoCanvas = document.getElementById('videoCanvas');
  const canvasCtx = videoCanvas.getContext('2d');
  const captionOverlay = document.getElementById('captionOverlay');
  const timelineProgress = document.getElementById('timelineProgress');
  const cueTableBody = document.getElementById('cueTableBody');
  const dubProjectSelect = document.getElementById('dubProjectSelect');
  const dubVoiceSelect = document.getElementById('dubVoiceSelect');
  const foleyBedVol = document.getElementById('foleyBedVol');
  const foleyVolDisp = document.getElementById('foleyVolDisp');
  const chkAutoPacing = document.getElementById('chkAutoPacing');

  const btnPlayDub = document.getElementById('btnPlayDub');
  const btnStopDub = document.getElementById('btnStopDub');
  const btnExportSrt = document.getElementById('btnExportSrt');
  const btnExportDubWav = document.getElementById('btnExportDubWav');

  // Load voices
  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    dubVoiceSelect.innerHTML = '<option value="">Default System Voice</option>';
    voices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})`;
      dubVoiceSelect.appendChild(opt);
    });
    autoMatchVoice();
  }
  loadVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function autoMatchVoice() {
    const proj = DUB_PROJECTS[dubProjectSelect.value];
    if (!proj || !voices.length) return;
    const match = voices.findIndex(v => v.lang.toLowerCase().startsWith(proj.lang));
    if (match !== -1) dubVoiceSelect.value = match;
  }

  // Populate Cues Table
  function renderCues() {
    const proj = DUB_PROJECTS[dubProjectSelect.value];
    cueTableBody.innerHTML = '';
    proj.cues.forEach((c, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'cue-row';
      tr.id = `cue-row-${idx}`;
      tr.innerHTML = `
        <td style="font-family: monospace; color: #00e5ff;">00:${String(Math.floor(c.start)).padStart(2, '0')}.0</td>
        <td style="font-family: monospace; color: #ffb300;">00:${String(Math.floor(c.end)).padStart(2, '0')}.0</td>
        <td style="color: var(--text-secondary);">${c.orig}</td>
        <td style="color: #fff; font-weight: 600;">${c.dub}</td>
      `;
      cueTableBody.appendChild(tr);
    });
    autoMatchVoice();
  }

  dubProjectSelect.addEventListener('change', () => {
    stopPlayback();
    renderCues();
  });

  foleyBedVol.addEventListener('input', () => {
    foleyVolDisp.textContent = `${foleyBedVol.value}%`;
    if (foleyGainNode && audioCtx) {
      foleyGainNode.gain.setValueAtTime((foleyBedVol.value / 100) * 0.25, audioCtx.currentTime);
    }
  });

  // Audio Context & Foley Bed
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function startFoleyBed(ctx, dest) {
    stopFoley();
    const g = ctx.createGain();
    const vol = (foleyBedVol.value / 100) * 0.25;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    foleyGainNode = g;
    g.connect(dest);

    // Warm cinematic room ambiance
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65.41, ctx.currentTime);
    osc.connect(g);
    osc.start();
    foleyOscs.push(osc);
  }

  function stopFoley() {
    foleyOscs.forEach(o => { try { o.stop(); } catch(e){} });
    foleyOscs = [];
  }

  // Draw simulated video scene
  function drawVideoFrame(t, activeText) {
    const w = videoCanvas.width = videoCanvas.clientWidth || 400;
    const h = videoCanvas.height = videoCanvas.clientHeight || 225;

    // Cinematic dark gradient background
    const grad = canvasCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0a101f');
    grad.addColorStop(0.5, '#05070d');
    grad.addColorStop(1, '#020306');
    canvasCtx.fillStyle = grad;
    canvasCtx.fillRect(0, 0, w, h);

    // Animated sound waves radiating from center actor silhouette
    const centerX = w / 2;
    const centerY = h * 0.42;

    if (isPlaying) {
      const pulse = Math.sin(t * 8) * 15;
      canvasCtx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      canvasCtx.lineWidth = 2;
      canvasCtx.beginPath();
      canvasCtx.arc(centerX, centerY, 45 + pulse, 0, Math.PI * 2);
      canvasCtx.stroke();

      canvasCtx.strokeStyle = 'rgba(0, 230, 118, 0.25)';
      canvasCtx.beginPath();
      canvasCtx.arc(centerX, centerY, 65 + pulse * 1.5, 0, Math.PI * 2);
      canvasCtx.stroke();
    }

    // Actor Avatar Silhouette
    canvasCtx.fillStyle = '#1c2438';
    canvasCtx.beginPath();
    canvasCtx.arc(centerX, centerY - 12, 22, 0, Math.PI * 2);
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.ellipse(centerX, centerY + 38, 38, 24, 0, 0, Math.PI * 2);
    canvasCtx.fill();

    // Timecode stamp in top-left
    canvasCtx.fillStyle = '#00e5ff';
    canvasCtx.font = '11px monospace';
    canvasCtx.fillText(`TC 00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(Math.floor((t % 1) * 30)).padStart(2, '0')}`, 15, 25);
  }

  // Playback Loop
  function playDub() {
    stopPlayback();
    const ctx = getAudioContext();
    isPlaying = true;
    playbackStartTime = performance.now();
    triggeredCues.clear();

    const proj = DUB_PROJECTS[dubProjectSelect.value];
    startFoleyBed(ctx, ctx.destination);

    function tick() {
      if (!isPlaying) return;
      const elapsed = (performance.now() - playbackStartTime) / 1000;
      const progress = Math.min(100, (elapsed / proj.totalDuration) * 100);
      timelineProgress.style.width = `${progress}%`;

      // Check active cues
      let currentCaption = "[SCENE IN PROGRESS - LISTENING TO DUB]";
      proj.cues.forEach((c, idx) => {
        const row = document.getElementById(`cue-row-${idx}`);
        if (elapsed >= c.start && elapsed <= c.end) {
          if (row) row.classList.add('active');
          currentCaption = c.dub;

          // Trigger speech if not already fired
          if (!triggeredCues.has(idx)) {
            triggeredCues.add(idx);
            speakCue(c);
          }
        } else {
          if (row) row.classList.remove('active');
        }
      });

      captionOverlay.textContent = currentCaption;
      drawVideoFrame(elapsed, currentCaption);

      if (elapsed < proj.totalDuration) {
        animId = requestAnimationFrame(tick);
      } else {
        stopPlayback();
        captionOverlay.textContent = "[DUBBING COMPLETED]";
      }
    }

    animId = requestAnimationFrame(tick);
  }

  function speakCue(cue) {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(cue.dub);

    if (chkAutoPacing.checked) {
      const dur = cue.end - cue.start;
      const words = cue.dub.split(/\s+/).length;
      const baseRate = (words / dur) * 0.38;
      utter.rate = Math.min(1.35, Math.max(0.85, baseRate));
    } else {
      utter.rate = 1.0;
    }

    if (dubVoiceSelect.value !== '' && voices[dubVoiceSelect.value]) {
      utter.voice = voices[dubVoiceSelect.value];
    }

    window.speechSynthesis.speak(utter);
  }

  function stopPlayback() {
    isPlaying = false;
    cancelAnimationFrame(animId);
    stopFoley();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    timelineProgress.style.width = '0%';
    document.querySelectorAll('.cue-row').forEach(r => r.classList.remove('active'));
    drawVideoFrame(0, '');
  }

  btnPlayDub.addEventListener('click', playDub);
  btnStopDub.addEventListener('click', stopPlayback);

  // Export SRT
  btnExportSrt.addEventListener('click', () => {
    const proj = DUB_PROJECTS[dubProjectSelect.value];
    let srt = '';
    proj.cues.forEach((c, idx) => {
      const sSec = String(Math.floor(c.start)).padStart(2, '0');
      const eSec = String(Math.floor(c.end)).padStart(2, '0');
      srt += `${idx + 1}\n00:00:${sSec},000 --> 00:00:${eSec},000\n${c.dub}\n\n`;
    });

    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dubbed_subtitles_${dubProjectSelect.value}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Export Dub Audio Track (WAV)
  btnExportDubWav.addEventListener('click', async () => {
    btnExportDubWav.disabled = true;
    btnExportDubWav.innerHTML = '<span>Rendering Audio...</span>';

    try {
      const sampleRate = 44100;
      const duration = 12.0;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * duration, sampleRate);

      startFoleyBed(offlineCtx, offlineCtx.destination);

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dub_foley_bed_${dubProjectSelect.value}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error rendering audio: ' + e.message);
    } finally {
      btnExportDubWav.disabled = false;
      btnExportDubWav.innerHTML = 'Download Dub Audio (WAV)';
    }
  });

  // Init
  renderCues();
  drawVideoFrame(0, '');
});