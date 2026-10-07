// Brand Jingle & Sonic Logo Creator - Engine

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

const NOTES = {
  'REST': 0,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50
};

const JINGLE_PRESETS = {
  intel: {
    name: "Tech Chime",
    notes: ['D4', 'G4', 'D4', 'A4', 'G4'],
    tempo: 180,
    instrument: 'bell'
  },
  netflix: {
    name: "Ta-Dum Sub",
    notes: ['C3', 'REST', 'G3', 'C4', 'REST'],
    tempo: 280,
    instrument: 'brass'
  },
  playful: {
    name: "Playful Whistle",
    notes: ['C5', 'D5', 'E5', 'G4', 'A4'],
    tempo: 200,
    instrument: 'marimba'
  },
  luxury: {
    name: "Luxury Swell",
    notes: ['A3', 'E4', 'A4', 'C#5', 'E5'],
    tempo: 260,
    instrument: 'rhodes'
  },
  startup: {
    name: "SaaS Uplift",
    notes: ['C4', 'E4', 'G4', 'B4', 'C5'],
    tempo: 160,
    instrument: 'pluck'
  },
  arcade: {
    name: "Retro Arcade",
    notes: ['C4', 'E4', 'G4', 'C5', 'G5'],
    tempo: 120,
    instrument: 'pluck'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  const numSteps = 5;
  let currentNotes = ['D4', 'G4', 'D4', 'A4', 'G4'];

  const sequencerGrid = document.getElementById('sequencerGrid');
  const instrumentType = document.getElementById('instrumentType');
  const jingleTempo = document.getElementById('jingleTempo');
  const noteSustain = document.getElementById('noteSustain');
  const reverbDepth = document.getElementById('reverbDepth');
  const tempoDisp = document.getElementById('tempoDisp');
  const decayDisp = document.getElementById('decayDisp');
  const reverbDisp = document.getElementById('reverbDisp');
  const chkSubImpact = document.getElementById('chkSubImpact');
  const chkShimmer = document.getElementById('chkShimmer');

  const brandIdentityName = document.getElementById('brandIdentityName');
  const brandTagline = document.getElementById('brandTagline');
  const chkSpeakTagline = document.getElementById('chkSpeakTagline');

  const btnPlayJingle = document.getElementById('btnPlayJingle');
  const btnDownloadJingleWav = document.getElementById('btnDownloadJingleWav');

  // Build Sequencer Slots
  function buildSequencer() {
    sequencerGrid.innerHTML = '';
    for (let i = 0; i < numSteps; i++) {
      const slot = document.createElement('div');
      slot.className = 'note-slot';
      slot.id = `slot-${i}`;

      const num = document.createElement('span');
      num.className = 'note-number';
      num.textContent = `STEP ${i + 1}`;
      slot.appendChild(num);

      const sel = document.createElement('select');
      sel.className = 'note-select';
      Object.keys(NOTES).forEach(n => {
        const opt = document.createElement('option');
        opt.value = n;
        opt.textContent = n;
        if (n === currentNotes[i]) opt.selected = true;
        sel.appendChild(opt);
      });

      sel.addEventListener('change', () => {
        currentNotes[i] = sel.value;
      });

      slot.appendChild(sel);
      sequencerGrid.appendChild(slot);
    }
  }

  buildSequencer();

  // Slider Display Listeners
  jingleTempo.addEventListener('input', () => { tempoDisp.textContent = `${jingleTempo.value} ms`; });
  noteSustain.addEventListener('input', () => { decayDisp.textContent = `${parseFloat(noteSustain.value).toFixed(1)}s`; });
  reverbDepth.addEventListener('input', () => { reverbDisp.textContent = `${reverbDepth.value}%`; });

  // Preset Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = JINGLE_PRESETS[btn.dataset.preset];
      if (!p) return;
      currentNotes = [...p.notes];
      jingleTempo.value = p.tempo;
      tempoDisp.textContent = `${p.tempo} ms`;
      instrumentType.value = p.instrument;
      buildSequencer();
      playJingle();
    });
  });

  // Audio Context
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

  // Synthesize Single Note
  function triggerNote(ctx, freq, startTime, duration, timbre, dest) {
    if (freq <= 0) return; // REST

    const decay = parseFloat(noteSustain.value) || 1.2;
    const endTime = startTime + decay;

    if (timbre === 'bell') {
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 2.756, startTime); // Bell overtone

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(dest);

      osc.start(startTime);
      osc.stop(endTime + 0.1);
      oscHarmonic.start(startTime);
      oscHarmonic.stop(endTime + 0.1);

    } else if (timbre === 'pluck') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 8, startTime);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + 0.25);

      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay * 0.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(startTime);
      osc.stop(endTime);

    } else if (timbre === 'marimba') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(startTime);
      osc.stop(startTime + 0.45);

    } else if (timbre === 'rhodes') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);

      osc1.start(startTime);
      osc1.stop(endTime);
      osc2.start(startTime);
      osc2.stop(endTime);

    } else {
      // brass
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.005, startTime); // Detune

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);

      osc1.start(startTime);
      osc1.stop(endTime);
      osc2.start(startTime);
      osc2.stop(endTime);
    }
  }

  // Play Sequence
  function playJingle(customCtx = null, customDest = null) {
    const ctx = customCtx || getAudioContext();
    const dest = customDest || ctx.destination;
    const now = ctx.currentTime + 0.05;
    const spacing = (parseFloat(jingleTempo.value) || 220) / 1000;
    const timbre = instrumentType.value;

    // Sub Bass impact on note 1
    if (chkSubImpact.checked) {
      const sub = ctx.createOscillator();
      const subG = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(110, now);
      sub.frequency.exponentialRampToValueAtTime(38, now + 0.8);
      subG.gain.setValueAtTime(0.5, now);
      subG.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      sub.connect(subG);
      subG.connect(dest);
      sub.start(now);
      sub.stop(now + 1.0);
    }

    currentNotes.forEach((noteName, idx) => {
      const freq = NOTES[noteName] || 0;
      const noteTime = now + idx * spacing;
      triggerNote(ctx, freq, noteTime, spacing, timbre, dest);

      // Shimmer sparkle
      if (chkShimmer.checked && freq > 0) {
        triggerNote(ctx, freq * 2, noteTime, spacing, 'bell', dest);
      }

      // Visual highlight if real-time
      if (!customCtx) {
        setTimeout(() => {
          document.querySelectorAll('.note-slot').forEach(s => s.classList.remove('playing'));
          const activeSlot = document.getElementById(`slot-${idx}`);
          if (activeSlot) activeSlot.classList.add('playing');
        }, idx * spacing * 1000);
      }
    });

    // Cleanup visual highlight
    if (!customCtx) {
      setTimeout(() => {
        document.querySelectorAll('.note-slot').forEach(s => s.classList.remove('playing'));
        if (chkSpeakTagline.checked && brandTagline.value.trim() && ('speechSynthesis' in window)) {
          const utter = new SpeechSynthesisUtterance(brandTagline.value.trim());
          utter.rate = 1.0;
          window.speechSynthesis.speak(utter);
        }
      }, currentNotes.length * spacing * 1000 + 400);
    }
  }

  btnPlayJingle.addEventListener('click', () => playJingle());

  // Download Jingle WAV
  btnDownloadJingleWav.addEventListener('click', async () => {
    btnDownloadJingleWav.disabled = true;
    btnDownloadJingleWav.innerHTML = '<span>Rendering Audio...</span>';

    try {
      const sampleRate = 44100;
      const duration = 4.0;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * duration, sampleRate);

      playJingle(offlineCtx, offlineCtx.destination);

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = brandIdentityName.value.trim().replace(/\s+/g, '_') || 'brand';
      a.download = `sonic_logo_${slug}_${instrumentType.value}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error rendering jingle: ' + e.message);
    } finally {
      btnDownloadJingleWav.disabled = false;
      btnDownloadJingleWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>
        <span>Download Master Jingle (WAV)</span>
      `;
    }
  });
});