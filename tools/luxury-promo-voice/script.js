// Luxury Promo Voice Studio - Engine

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

const LUX_SCRIPTS = {
  watch: {
    maison: "Vacheron & Co.",
    creation: "Chronographe Tourbillon",
    text: "Time is not measured. It is mastered. Introducing the {creation} by {maison}. Centuries of Swiss horological mastery, beating in relentless silence at twenty-eight thousand vibrations per hour. For those who do not follow time, but govern their own legacy."
  },
  perfume: {
    maison: "Maison de L'Ombre",
    creation: "Extrait de Nuit",
    text: "An olfactory silhouette sculpted from velvet amber, smoked cedar, and forbidden iris. {creation} by {maison}. Subtle yet intoxicating. Unforgettable yet elusive. Not crafted for everyone. Only for you."
  },
  supercar: {
    maison: "Aura Automobili",
    creation: "Veloce Grand Tourer",
    text: "Power without elegance is mere force. {maison} unveils {creation}. Hand-formed carbon fiber concealing eight hundred horses of pure electrified precision. In a world of hurried consensus, drive unapologetically."
  },
  resort: {
    maison: "L'Archipel Retreat",
    creation: "The Cobalt Pavilions",
    text: "Beyond the horizon lies a stillness few ever touch. Welcome to {creation} by {maison}. Where time dissolves into pristine waters and private sanctuary. Here, luxury is simply having the world leave you entirely in peace."
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let activeNodes = [];
  let isPlaying = false;

  // DOM
  const luxuryDomain = document.getElementById('luxuryDomain');
  const maisonName = document.getElementById('maisonName');
  const creationName = document.getElementById('creationName');
  const luxuryScript = document.getElementById('luxuryScript');

  const luxVoiceSelect = document.getElementById('luxVoiceSelect');
  const luxVoiceRate = document.getElementById('luxVoiceRate');
  const luxVoicePitch = document.getElementById('luxVoicePitch');
  const luxRateDisp = document.getElementById('luxRateDisp');
  const luxPitchDisp = document.getElementById('luxPitchDisp');

  const chkWatchEscapement = document.getElementById('chkWatchEscapement');
  const chkWarmDrone = document.getElementById('chkWarmDrone');

  const btnPlayLuxury = document.getElementById('btnPlayLuxury');
  const btnStopLuxury = document.getElementById('btnStopLuxury');
  const btnDownloadLuxuryWav = document.getElementById('btnDownloadLuxuryWav');

  // Populate Voices
  let voices = [];
  function populateVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    luxVoiceSelect.innerHTML = '<option value="">Default System Voice</option>';
    voices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})`;
      luxVoiceSelect.appendChild(opt);
    });

    // Pick deep / natural voice if available
    const deepVoiceIdx = voices.findIndex(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Guy') || v.name.includes('David') || v.name.includes('George')));
    if (deepVoiceIdx !== -1) luxVoiceSelect.value = deepVoiceIdx;
  }
  populateVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Update Script
  function updateScript() {
    const s = LUX_SCRIPTS[luxuryDomain.value] || LUX_SCRIPTS.watch;
    maisonName.value = s.maison;
    creationName.value = s.creation;
    renderText();
  }

  function renderText() {
    const s = LUX_SCRIPTS[luxuryDomain.value] || LUX_SCRIPTS.watch;
    let text = s.text
      .replace(/{maison}/g, maisonName.value.trim() || 'The Maison')
      .replace(/{creation}/g, creationName.value.trim() || 'Our Masterpiece');
    luxuryScript.value = text;
  }

  luxuryDomain.addEventListener('change', updateScript);
  [maisonName, creationName].forEach(el => el.addEventListener('input', renderText));

  luxVoiceRate.addEventListener('input', () => { luxRateDisp.textContent = `${parseFloat(luxVoiceRate.value).toFixed(2)}x`; });
  luxVoicePitch.addEventListener('input', () => { luxPitchDisp.textContent = `${parseFloat(luxVoicePitch.value).toFixed(2)}x`; });

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

  // Synthesize Swiss Mechanical Escapement Pulses
  function startWatchEscapement(ctx, duration, dest) {
    const now = ctx.currentTime;
    const ticksPerSec = 4; // 4 Hz mechanical rhythm (28,800 vph divided)
    const totalTicks = Math.floor(duration * ticksPerSec);

    for (let i = 0; i < totalTicks; i++) {
      const tickTime = now + (i / ticksPerSec);

      // Micro click impulse
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800, tickTime);
      osc.frequency.exponentialRampToValueAtTime(800, tickTime + 0.012);

      const amp = (i % 2 === 0) ? 0.08 : 0.05; // Alternating pallet stone impulse
      gain.gain.setValueAtTime(amp, tickTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, tickTime + 0.015);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(tickTime);
      osc.stop(tickTime + 0.02);
      activeNodes.push(osc);
    }
  }

  // Synthesize Velvet Silk Ambient Drone
  function startSilkDrone(ctx, duration, dest) {
    const now = ctx.currentTime;
    // Warm low drone C2 (65.41Hz) + G2 (98Hz)
    [65.41, 98.00, 196.00].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.06 / (idx + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(amp, now + 1.0);
      gain.gain.setValueAtTime(amp, now + duration - 1.0);
      gain.gain.linearRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + duration + 0.1);
      activeNodes.push(osc);
    });
  }

  // Play Luxury Audio
  function playLuxuryExperience() {
    stopLuxury();
    const ctx = getAudioContext();
    isPlaying = true;
    const duration = 18.0;

    if (chkWatchEscapement.checked) {
      startWatchEscapement(ctx, duration, ctx.destination);
    }
    if (chkWarmDrone.checked) {
      startSilkDrone(ctx, duration, ctx.destination);
    }

    const script = luxuryScript.value.trim();
    if (script && ('speechSynthesis' in window)) {
      const utter = new SpeechSynthesisUtterance(script);
      utter.rate = parseFloat(luxVoiceRate.value) || 0.85;
      utter.pitch = parseFloat(luxVoicePitch.value) || 0.90;

      if (luxVoiceSelect.value !== '' && voices[luxVoiceSelect.value]) {
        utter.voice = voices[luxVoiceSelect.value];
      }

      utter.onend = () => { isPlaying = false; };
      utter.onerror = () => { isPlaying = false; };

      setTimeout(() => {
        if (isPlaying) window.speechSynthesis.speak(utter);
      }, 500);
    }
  }

  function stopLuxury() {
    isPlaying = false;
    activeNodes.forEach(n => { try { n.stop(); } catch(e){} });
    activeNodes = [];

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  btnPlayLuxury.addEventListener('click', playLuxuryExperience);
  btnStopLuxury.addEventListener('click', stopLuxury);

  // Download Luxury Soundscape WAV
  btnDownloadLuxuryWav.addEventListener('click', async () => {
    btnDownloadLuxuryWav.disabled = true;
    btnDownloadLuxuryWav.innerHTML = '<span>Rendering Audio...</span>';

    try {
      const sampleRate = 44100;
      const duration = 14.0;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * duration, sampleRate);

      startWatchEscapement(offlineCtx, duration, offlineCtx.destination);
      startSilkDrone(offlineCtx, duration, offlineCtx.destination);

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luxury_soundscape_${luxuryDomain.value}_${maisonName.value.replace(/\s+/g, '_')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error rendering audio: ' + e.message);
    } finally {
      btnDownloadLuxuryWav.disabled = false;
      btnDownloadLuxuryWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>
        <span>Download Soundscape (WAV)</span>
      `;
    }
  });

  // Init
  updateScript();
});