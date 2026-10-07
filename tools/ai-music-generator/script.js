// AI Procedural Music Generator - Web Audio Algorithmic Synthesizer

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

const GENRE_CONFIGS = {
  lofi: {
    label: "Lo-Fi Chill Beats",
    bpm: 78,
    scale: "A Minor / C Major",
    chords: [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
      [164.81, 196.00, 246.94, 293.66]  // Em7
    ],
    bassNotes: [110.00, 87.31, 98.00, 82.41]
  },
  synthwave: {
    label: "Cyber Synthwave 1984",
    bpm: 122,
    scale: "D Minor",
    chords: [
      [146.83, 220.00, 293.66, 349.23], // Dm
      [116.54, 174.61, 233.08, 293.66], // Bb
      [130.81, 196.00, 261.63, 329.63], // C
      [110.00, 164.81, 220.00, 261.63]  // Am
    ],
    bassNotes: [73.42, 58.27, 65.41, 55.00]
  },
  ambient: {
    label: "Luxury Ambient Drone",
    bpm: 64,
    scale: "Pentatonic Ethereal",
    chords: [
      [130.81, 196.00, 261.63, 392.00, 523.25],
      [146.83, 220.00, 293.66, 440.00, 587.33],
      [110.00, 164.81, 220.00, 329.63, 440.00]
    ],
    bassNotes: [65.41, 73.42, 55.00]
  },
  cinematic: {
    label: "Cinematic Tension Rise",
    bpm: 90,
    scale: "C Harmonic Minor",
    chords: [
      [130.81, 155.56, 196.00, 246.94], // Cm(maj7)
      [116.54, 146.83, 174.61, 233.08], // Ab
      [98.00, 123.47, 146.83, 196.00]   // G
    ],
    bassNotes: [65.41, 58.27, 49.00]
  },
  dance: {
    label: "Electronic Dance Pulse",
    bpm: 128,
    scale: "F Minor",
    chords: [
      [174.61, 207.65, 261.63], // Fm
      [138.59, 174.61, 207.65], // Db
      [155.56, 196.00, 233.08]  // Eb
    ],
    bassNotes: [87.31, 69.30, 77.78]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let isPlaying = false;
  let loopTimer = null;
  let activeNodes = [];
  let masterFilter = null;
  let analyser = null;
  let animId = null;

  let currentGenreKey = 'lofi';
  let barIndex = 0;

  // DOM
  const currentGenreLabel = document.getElementById('currentGenreLabel');
  const tempoInfo = document.getElementById('tempoInfo');
  const scaleInfo = document.getElementById('scaleInfo');
  const btnTogglePlay = document.getElementById('btnTogglePlay');
  const playBtnText = document.getElementById('playBtnText');
  const playIconSvg = document.getElementById('playIconSvg');
  const btnNewSeed = document.getElementById('btnNewSeed');
  const btnDownloadWavLoop = document.getElementById('btnDownloadWavLoop');

  const chkMuteDrums = document.getElementById('chkMuteDrums');
  const chkMuteBass = document.getElementById('chkMuteBass');
  const chkMuteChords = document.getElementById('chkMuteChords');
  const chkMuteLead = document.getElementById('chkMuteLead');

  const tempoSlider = document.getElementById('tempoSlider');
  const filterCutoff = document.getElementById('filterCutoff');
  const reverbSpace = document.getElementById('reverbSpace');
  const bpmDisp = document.getElementById('bpmDisp');
  const filterDisp = document.getElementById('filterDisp');
  const reverbSpaceDisp = document.getElementById('reverbSpaceDisp');

  const canvas = document.getElementById('synthVisualizer');
  const canvasCtx = canvas.getContext('2d');

  // Genre selection
  document.querySelectorAll('.genre-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.genre-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      setGenre(card.dataset.genre);
    });
  });

  function setGenre(key) {
    currentGenreKey = key;
    const cfg = GENRE_CONFIGS[key];
    currentGenreLabel.textContent = cfg.label;
    tempoSlider.value = cfg.bpm;
    bpmDisp.textContent = `${cfg.bpm} BPM`;
    tempoInfo.textContent = `TEMPO: ${cfg.bpm} BPM`;
    scaleInfo.textContent = `SCALE: ${cfg.scale}`;
    if (isPlaying) {
      restartEngine();
    }
  }

  // Slider controls
  tempoSlider.addEventListener('input', () => {
    bpmDisp.textContent = `${tempoSlider.value} BPM`;
    tempoInfo.textContent = `TEMPO: ${tempoSlider.value} BPM`;
  });

  filterCutoff.addEventListener('input', () => {
    filterDisp.textContent = `${filterCutoff.value} Hz`;
    if (masterFilter && audioCtx) {
      masterFilter.frequency.setValueAtTime(parseFloat(filterCutoff.value), audioCtx.currentTime);
    }
  });

  reverbSpace.addEventListener('input', () => {
    reverbSpaceDisp.textContent = `${reverbSpace.value}%`;
  });

  // Audio Context
  function initAudio() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      masterFilter = audioCtx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(parseFloat(filterCutoff.value), audioCtx.currentTime);

      masterFilter.connect(analyser);
      analyser.connect(audioCtx.destination);

      startVisualizer();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Synthesize Drum Elements
  function scheduleKick(ctx, time, dest) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
    g.gain.setValueAtTime(0.5, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(g);
    g.connect(dest);
    osc.start(time);
    osc.stop(time + 0.18);
    activeNodes.push(osc);
  }

  function scheduleSnare(ctx, time, dest) {
    const bufLen = ctx.sampleRate * 0.12;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    src.connect(hp);
    hp.connect(g);
    g.connect(dest);
    src.start(time);
    activeNodes.push(src);
  }

  function scheduleHiHat(ctx, time, dest) {
    const bufLen = ctx.sampleRate * 0.04;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    src.connect(hp);
    hp.connect(g);
    g.connect(dest);
    src.start(time);
    activeNodes.push(src);
  }

  // Synthesize One Bar
  function renderBar(ctx, startTime, barIdx, dest) {
    const cfg = GENRE_CONFIGS[currentGenreKey];
    const bpm = parseFloat(tempoSlider.value) || cfg.bpm;
    const beatSec = 60 / bpm;
    const chord = cfg.chords[barIdx % cfg.chords.length];
    const bassFreq = cfg.bassNotes[barIdx % cfg.bassNotes.length];

    // 1. Drums
    if (chkMuteDrums.checked && currentGenreKey !== 'ambient') {
      // 4 beats
      for (let b = 0; b < 4; b++) {
        const beatTime = startTime + b * beatSec;
        if (currentGenreKey === 'dance') {
          // 4-on-the-floor kick
          scheduleKick(ctx, beatTime, dest);
          // offbeat hi-hat
          scheduleHiHat(ctx, beatTime + beatSec * 0.5, dest);
        } else {
          // LoFi / Synthwave standard groove
          if (b === 0 || b === 2) scheduleKick(ctx, beatTime, dest);
          if (b === 1 || b === 3) scheduleSnare(ctx, beatTime, dest);
          scheduleHiHat(ctx, beatTime, dest);
          scheduleHiHat(ctx, beatTime + beatSec * 0.5, dest);
        }
      }
    }

    // 2. Bassline
    if (chkMuteBass.checked) {
      if (currentGenreKey === 'synthwave') {
        // 8th-note driving bass
        for (let s = 0; s < 8; s++) {
          const t = startTime + s * (beatSec / 2);
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(s % 2 === 0 ? bassFreq : bassFreq * 2, t);
          g.gain.setValueAtTime(0.18, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + (beatSec / 2) * 0.9);
          osc.connect(g);
          g.connect(dest);
          osc.start(t);
          osc.stop(t + (beatSec / 2));
          activeNodes.push(osc);
        }
      } else {
        // Sustained sub bass note
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bassFreq, startTime);
        g.gain.setValueAtTime(0.28, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + beatSec * 3.8);
        osc.connect(g);
        g.connect(dest);
        osc.start(startTime);
        osc.stop(startTime + beatSec * 4);
        activeNodes.push(osc);
      }
    }

    // 3. Chords & Harmony
    if (chkMuteChords.checked) {
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = (currentGenreKey === 'synthwave') ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        const amp = 0.15 / chord.length;
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(amp, startTime + 0.1);
        g.gain.exponentialRampToValueAtTime(0.0001, startTime + beatSec * 3.9);

        osc.connect(g);
        g.connect(dest);
        osc.start(startTime);
        osc.stop(startTime + beatSec * 4);
        activeNodes.push(osc);
      });
    }

    // 4. Lead Melody / Arpeggio
    if (chkMuteLead.checked) {
      // 16th-note arpeggiated sparkle
      for (let step = 0; step < 8; step++) {
        const t = startTime + step * (beatSec / 2);
        const note = chord[step % chord.length] * 2;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, t);
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        osc.connect(g);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + 0.25);
        activeNodes.push(osc);
      }
    }
  }

  // Real-Time Scheduler Loop
  function startPlayback() {
    initAudio();
    isPlaying = true;
    playBtnText.textContent = 'Pause Music Stream';
    playIconSvg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';

    barIndex = 0;
    scheduleNextBar();
  }

  function scheduleNextBar() {
    if (!isPlaying) return;
    const cfg = GENRE_CONFIGS[currentGenreKey];
    const bpm = parseFloat(tempoSlider.value) || cfg.bpm;
    const barSec = (60 / bpm) * 4;

    renderBar(audioCtx, audioCtx.currentTime + 0.05, barIndex, masterFilter);
    barIndex++;

    loopTimer = setTimeout(scheduleNextBar, (barSec - 0.08) * 1000);
  }

  function stopPlayback() {
    isPlaying = false;
    clearTimeout(loopTimer);
    playBtnText.textContent = 'Start Music Stream';
    playIconSvg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';

    activeNodes.forEach(n => { try { n.stop(); } catch(e){} });
    activeNodes = [];
  }

  function restartEngine() {
    if (isPlaying) {
      stopPlayback();
      startPlayback();
    }
  }

  btnTogglePlay.addEventListener('click', () => {
    if (isPlaying) stopPlayback();
    else startPlayback();
  });

  btnNewSeed.addEventListener('click', () => {
    barIndex += 2;
    if (isPlaying) restartEngine();
  });

  // Visualizer Animation
  function startVisualizer() {
    if (!analyser || !canvas) return;
    const bufLen = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufLen);

    function draw() {
      animId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width = canvas.clientWidth || 300;
      const h = canvas.height = canvas.clientHeight || 110;

      canvasCtx.fillStyle = '#03050a';
      canvasCtx.fillRect(0, 0, w, h);

      const barWidth = (w / bufLen) * 2.2;
      let x = 0;

      for (let i = 0; i < bufLen; i++) {
        const val = dataArray[i];
        const barHeight = (val / 255) * h * 0.88;

        const hue = 190 + (i / bufLen) * 60;
        canvasCtx.fillStyle = val > 5 ? `hsl(${hue}, 100%, ${45 + (val/255)*25}%)` : 'rgba(255, 255, 255, 0.03)';
        canvasCtx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
        x += barWidth;
        if (x > w) break;
      }
    }
    draw();
  }

  // Download Loop as WAV
  btnDownloadWavLoop.addEventListener('click', async () => {
    btnDownloadWavLoop.disabled = true;
    btnDownloadWavLoop.innerHTML = '<span>Rendering 4-Bar Master Loop...</span>';

    try {
      const cfg = GENRE_CONFIGS[currentGenreKey];
      const bpm = parseFloat(tempoSlider.value) || cfg.bpm;
      const barSec = (60 / bpm) * 4;
      const totalDuration = barSec * 4; // 4 full bars
      const sampleRate = 44100;

      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * totalDuration, sampleRate);

      const offFilter = offlineCtx.createBiquadFilter();
      offFilter.type = 'lowpass';
      offFilter.frequency.value = parseFloat(filterCutoff.value);
      offFilter.connect(offlineCtx.destination);

      for (let b = 0; b < 4; b++) {
        renderBar(offlineCtx, b * barSec, b, offFilter);
      }

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `algorithmic_loop_${currentGenreKey}_${bpm}bpm.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error rendering audio loop: ' + e.message);
    } finally {
      btnDownloadWavLoop.disabled = false;
      btnDownloadWavLoop.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Download Master Loop (WAV)</span>
      `;
    }
  });

  // Init
  setGenre('lofi');
});