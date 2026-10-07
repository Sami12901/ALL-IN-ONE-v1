// Airport Announcement Generator - Advanced Web Audio & Web Speech Engine

// --- WAV ENCODER UTILITY ---
function bufferToWave(abuffer, len) {
  const numOfChan = abuffer.numberOfChannels;
  const length = (len || abuffer.length) * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels = [], i, sample, offset = 0, pos = 0;

  function writeString(s) {
    for (let j = 0; j < s.length; j++) {
      out.setUint8(pos++, s.charCodeAt(j));
    }
  }

  function setUint16(data) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  writeString('RIFF');
  setUint32(length - 8);
  writeString('WAVE');
  writeString('fmt ');
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  writeString('data');
  setUint32(length - pos - 4);

  for (i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

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

// --- PRESET SCRIPTS ---
const PRESETS = {
  final_call: {
    status: 'FINAL CALL',
    text: 'This is the final boarding call for passengers booked on {airline} flight {flight} with service to {destination}. All remaining passengers please proceed immediately to Gate {gate}. The aircraft doors will close shortly.'
  },
  boarding: {
    status: 'BOARDING',
    text: 'Ladies and gentlemen, {airline} announces the boarding of flight {flight} non-stop to {destination}. We invite passengers requiring special assistance and families traveling with young children to board at Gate {gate}.'
  },
  priority: {
    status: 'PRIORITY BOARD',
    text: '{airline} invites First Class, Business Class, and SkyTeam Elite passengers on flight {flight} to {destination} to begin priority boarding through Gate {gate}.'
  },
  delayed: {
    status: 'DELAYED',
    text: 'May we have your attention please. {airline} flight {flight} departing for {destination} has been delayed due to inbound aircraft turnaround. Please monitor the departures screens for revised departure times.'
  },
  gate_change: {
    status: 'GATE CHANGED',
    text: 'Attention passengers on {airline} flight {flight} traveling to {destination}. Please note that the departure gate has been moved from previous gate to Gate {gate}. Boarding will commence shortly at Gate {gate}.'
  },
  security: {
    status: 'SECURITY NOTICE',
    text: 'Security announcement. For the safety of all travelers, please keep your personal luggage and belongings with you at all times. Unattended items in the terminal will be confiscated and destroyed by airport security.'
  },
  welcome: {
    status: 'ARRIVED',
    text: 'Welcome to our international terminal. We welcome passengers arriving on {airline} flight {flight} from {destination}. Baggage claim is located on Level 1, Carousels 3 and 4. We wish you a pleasant stay.'
  }
};

// --- CHIME DEFINITIONS (Frequencies & Timings) ---
const CHIMES = {
  classic: [
    { freq: 440, duration: 0.65, delay: 0 },       // A4
    { freq: 330, duration: 0.95, delay: 0.6 }      // E4
  ],
  four_tone: [
    { freq: 784, duration: 0.45, delay: 0 },       // G5
    { freq: 659, duration: 0.45, delay: 0.4 },     // E5
    { freq: 523, duration: 0.45, delay: 0.8 },     // C5
    { freq: 392, duration: 0.95, delay: 1.2 }      // G4
  ],
  triple_asian: [
    { freq: 587.33, duration: 0.5, delay: 0 },    // D5
    { freq: 739.99, duration: 0.5, delay: 0.45 }, // F#5
    { freq: 880, duration: 1.1, delay: 0.9 }       // A5
  ],
  soft_lounge: [
    { freq: 523.25, duration: 0.7, delay: 0 },     // C5
    { freq: 659.25, duration: 0.7, delay: 0.5 },   // E5
    { freq: 987.77, duration: 1.2, delay: 1.0 }    // B5
  ],
  modern_pulse: [
    { freq: 440, duration: 0.35, delay: 0 },
    { freq: 659, duration: 0.35, delay: 0.3 },
    { freq: 880, duration: 0.4, delay: 0.6 },
    { freq: 1174, duration: 0.8, delay: 0.9 }
  ]
};

// --- MAIN CONTROLLER ---
document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let analyser = null;
  let animFrameId = null;
  let ambientSource = null;
  let ambientGainNode = null;
  let isBroadcasting = false;

  // DOM Elements
  const inpAirline = document.getElementById('inpAirline');
  const inpFlight = document.getElementById('inpFlight');
  const inpDest = document.getElementById('inpDest');
  const inpGate = document.getElementById('inpGate');
  const dispAirline = document.getElementById('dispAirline');
  const dispFlight = document.getElementById('dispFlight');
  const dispDest = document.getElementById('dispDest');
  const dispGate = document.getElementById('dispGate');
  const dispStatus = document.getElementById('dispStatus');
  const fidsClock = document.getElementById('fidsClock');
  const announcementText = document.getElementById('announcementText');
  const charCount = document.getElementById('charCount');

  const chimeStyle = document.getElementById('chimeStyle');
  const voiceSelect = document.getElementById('voiceSelect');
  const speechRate = document.getElementById('speechRate');
  const speechPitch = document.getElementById('speechPitch');
  const rateVal = document.getElementById('rateVal');
  const pitchVal = document.getElementById('pitchVal');
  const reverbLevel = document.getElementById('reverbLevel');
  const ambientLevel = document.getElementById('ambientLevel');
  const reverbVal = document.getElementById('reverbVal');
  const ambientVal = document.getElementById('ambientVal');
  const chkPaMegaphone = document.getElementById('chkPaMegaphone');
  const chkRepeat = document.getElementById('chkRepeat');

  const btnPlay = document.getElementById('btnPlay');
  const btnChimeOnly = document.getElementById('btnChimeOnly');
  const btnStop = document.getElementById('btnStop');
  const btnDownloadWav = document.getElementById('btnDownloadWav');
  const micStatus = document.getElementById('micStatus');
  const vizStatus = document.getElementById('vizStatus');
  const canvas = document.getElementById('audioVisualizer');
  const canvasCtx = canvas.getContext('2d');

  // Clock Update
  function updateClock() {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    if (fidsClock) fidsClock.textContent = `${h}:${m}:${s} UTC`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Populate SpeechSynthesis Voices
  let voices = [];
  function populateVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '<option value="">Default System Voice</option>';
    voices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})${v.default ? ' — Default' : ''}`;
      voiceSelect.appendChild(opt);
    });

    // Smart default: find English or preferred airport sounding voice
    const preferred = voices.findIndex(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny')));
    if (preferred !== -1) {
      voiceSelect.value = preferred;
    }
  }

  populateVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Sync inputs with FIDS display
  function syncFids() {
    dispAirline.textContent = inpAirline.value.trim() || 'Airlines';
    dispFlight.textContent = inpFlight.value.trim() || 'FLIGHT';
    dispDest.textContent = inpDest.value.trim() || 'DESTINATION';
    dispGate.textContent = inpGate.value.trim() || 'GATE';
  }

  [inpAirline, inpFlight, inpDest, inpGate].forEach(el => {
    el.addEventListener('input', () => {
      syncFids();
      updateScriptTemplate();
    });
  });

  // Current Preset State
  let currentPresetKey = 'final_call';

  function applyPreset(key) {
    currentPresetKey = key;
    const p = PRESETS[key] || PRESETS.final_call;
    dispStatus.textContent = p.status;
    updateScriptTemplate();
  }

  function updateScriptTemplate() {
    const p = PRESETS[currentPresetKey] || PRESETS.final_call;
    let template = p.text;
    template = template
      .replace(/{airline}/g, inpAirline.value.trim() || 'the airline')
      .replace(/{flight}/g, inpFlight.value.trim() || 'flight 101')
      .replace(/{destination}/g, inpDest.value.trim() || 'destination')
      .replace(/{gate}/g, inpGate.value.trim() || 'Gate A1');
    announcementText.value = template;
    charCount.textContent = `${template.length} characters`;
  }

  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyPreset(chip.dataset.preset);
    });
  });

  // Slider Listeners
  speechRate.addEventListener('input', () => {
    rateVal.textContent = `${parseFloat(speechRate.value).toFixed(2)}x`;
  });
  speechPitch.addEventListener('input', () => {
    pitchVal.textContent = `${parseFloat(speechPitch.value).toFixed(2)}x`;
  });
  reverbLevel.addEventListener('input', () => {
    reverbVal.textContent = `${reverbLevel.value}%`;
  });
  ambientLevel.addEventListener('input', () => {
    ambientVal.textContent = `${ambientLevel.value}%`;
    if (ambientGainNode) {
      ambientGainNode.gain.setValueAtTime((ambientLevel.value / 100) * 0.15, audioCtx.currentTime);
    }
  });

  announcementText.addEventListener('input', () => {
    charCount.textContent = `${announcementText.value.length} characters`;
  });

  // Initialize Web Audio Context
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      startVisualizer();
      startAmbientNoise();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Create synthetic impulse response for Terminal Reverb
  function buildImpulseResponse(ctx, duration = 2.5, decay = 2.0) {
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const n = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      left[i] = n;
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    return impulse;
  }

  // Subtle Terminal Background Hum
  function startAmbientNoise() {
    try {
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.05;
        b2 = 0.85 * b2 + white * 0.05;
        output[i] = (b0 + b1 + b2) * 0.1;
      }

      ambientSource = audioCtx.createBufferSource();
      ambientSource.buffer = noiseBuffer;
      ambientSource.loop = true;

      // Filter: deep ventilation rumble
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      ambientGainNode = audioCtx.createGain();
      ambientGainNode.gain.value = (ambientLevel.value / 100) * 0.15;

      ambientSource.connect(filter);
      filter.connect(ambientGainNode);
      ambientGainNode.connect(audioCtx.destination);
      ambientSource.start();
    } catch (e) {
      console.warn('Ambient noise init:', e);
    }
  }

  // Play Airport Chime on AudioContext
  function playChime(ctx, destinationNode, styleKey = 'classic', onComplete = null) {
    const chimeNotes = CHIMES[styleKey] || CHIMES.classic;
    const startTime = ctx.currentTime + 0.05;

    // Convolver reverb
    const convolver = ctx.createConvolver();
    convolver.buffer = buildImpulseResponse(ctx, 2.2, 1.8);

    const revGain = ctx.createGain();
    const dryGain = ctx.createGain();
    const revAmount = reverbLevel.value / 100;
    revGain.gain.value = revAmount * 0.7;
    dryGain.gain.value = 1.0 - revAmount * 0.3;

    // Megaphone PA Filter
    let filterIn = destinationNode;
    if (chkPaMegaphone.checked) {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 320;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3600;

      hp.connect(lp);
      lp.connect(destinationNode);
      filterIn = hp;
    }

    dryGain.connect(filterIn);
    convolver.connect(revGain);
    revGain.connect(filterIn);

    let maxEndTime = startTime;

    chimeNotes.forEach(note => {
      const noteStart = startTime + note.delay;
      const noteEnd = noteStart + note.duration;
      if (noteEnd > maxEndTime) maxEndTime = noteEnd;

      // Primary tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, noteStart);

      // Harmonic overtone for realistic bell resonance
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(note.freq * 2.02, noteStart);

      // Gain envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.35, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, noteStart);
      gain2.gain.linearRampToValueAtTime(0.12, noteStart + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration * 0.7);

      osc.connect(gain);
      osc2.connect(gain2);

      gain.connect(dryGain);
      gain.connect(convolver);
      gain2.connect(dryGain);
      gain2.connect(convolver);

      osc.start(noteStart);
      osc.stop(noteEnd + 0.1);
      osc2.start(noteStart);
      osc2.stop(noteEnd + 0.1);
    });

    const totalDuration = maxEndTime - ctx.currentTime;
    if (onComplete) {
      setTimeout(onComplete, totalDuration * 1000);
    }
    return totalDuration;
  }

  // Visualizer Animation Loop
  function startVisualizer() {
    if (!canvas || !analyser) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width = canvas.clientWidth || 300;
      const h = canvas.height = canvas.clientHeight || 90;

      canvasCtx.fillStyle = '#06090e';
      canvasCtx.fillRect(0, 0, w, h);

      const barWidth = (w / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * h * 0.85;

        // Gradient from cyan to amber
        const hue = 180 + (i / bufferLength) * 60;
        canvasCtx.fillStyle = dataArray[i] > 10 ? `hsl(${hue}, 95%, ${40 + (dataArray[i]/255)*30}%)` : 'rgba(255, 179, 0, 0.1)';

        canvasCtx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
        x += barWidth;
        if (x > w) break;
      }
    }
    draw();
  }

  // Broadcast Full Announcement
  function broadcastAnnouncement() {
    stopPlayback();
    const ctx = getAudioContext();
    isBroadcasting = true;
    micStatus.className = 'mic-live-indicator active';
    micStatus.innerHTML = '<span class="dot"></span> ON AIR &bull; BROADCASTING';
    vizStatus.textContent = 'TRANSMITTING &bull; 48 kHz PA';

    // Play chime first
    playChime(ctx, analyser, chimeStyle.value, () => {
      if (!isBroadcasting) return;

      const script = announcementText.value.trim();
      if (!script || !('speechSynthesis' in window)) {
        finishBroadcast();
        return;
      }

      // Mic click sound before speech
      playMicClick(ctx);

      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = parseFloat(speechRate.value) || 0.95;
      utterance.pitch = parseFloat(speechPitch.value) || 1.0;

      if (voiceSelect.value !== '' && voices[voiceSelect.value]) {
        utterance.voice = voices[voiceSelect.value];
      }

      utterance.onend = () => {
        if (!isBroadcasting) return;
        if (chkRepeat.checked) {
          // Play quick outro tone
          playChime(ctx, analyser, 'classic', finishBroadcast);
        } else {
          finishBroadcast();
        }
      };

      utterance.onerror = () => {
        finishBroadcast();
      };

      window.speechSynthesis.speak(utterance);
    });

    // Also connect analyser to destination
    analyser.connect(ctx.destination);
  }

  function playMicClick(ctx) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  function finishBroadcast() {
    isBroadcasting = false;
    micStatus.className = 'mic-live-indicator';
    micStatus.innerHTML = '<span class="dot"></span> PA SYSTEM READY';
    vizStatus.textContent = 'PA STANDBY &bull; 48.0 kHz';
  }

  function stopPlayback() {
    isBroadcasting = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    finishBroadcast();
  }

  // Play Chime Only Preview
  btnChimeOnly.addEventListener('click', () => {
    stopPlayback();
    const ctx = getAudioContext();
    analyser.connect(ctx.destination);
    playChime(ctx, analyser, chimeStyle.value);
  });

  btnPlay.addEventListener('click', broadcastAnnouncement);
  btnStop.addEventListener('click', stopPlayback);

  // Download Chime WAV Audio (High Quality Render)
  btnDownloadWav.addEventListener('click', async () => {
    btnDownloadWav.disabled = true;
    btnDownloadWav.innerHTML = '<span>Rendering Audio...</span>';

    try {
      const sampleRate = 44100;
      const durationSeconds = 3.5;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * durationSeconds, sampleRate);

      // Play chime in offline context
      playChime(offlineCtx, offlineCtx.destination, chimeStyle.value);

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = bufferToWave(renderedBuffer);

      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `airport_chime_${chimeStyle.value}_${inpFlight.value.replace(/\s+/g, '_') || 'flight'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('WAV rendering error:', err);
      alert('Error generating WAV audio: ' + err.message);
    } finally {
      btnDownloadWav.disabled = false;
      btnDownloadWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Download Chime Audio (WAV)</span>
      `;
    }
  });

  // Initial trigger
  syncFids();
  applyPreset('final_call');
});