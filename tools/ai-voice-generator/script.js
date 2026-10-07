// AI Voice Generator Studio - Client-Side Speech Synthesis & Vocal DSP Engine
// Pure Web Speech API & Web Audio API - Zero External Dependencies

let synth = null;
let voices = [];
let isSpeaking = false;
let isPaused = false;
let currentUtterance = null;
let animFrameId = null;

const SAMPLE_SCRIPTS = {
  commercial: "Introducing the pinnacle of audio craftsmanship. Sleek, powerful, and utterly uncompromising. Experience sound that moves you.",
  podcast: "Welcome back to Deep Focus. In today's episode, we explore the quiet revolutions reshaping modern technology and human creativity.",
  tech: "We have re-architected the entire pipeline from ground up. Delivering fifty percent lower latency, double the throughput, and zero downtime.",
  story: "The ancient city lay quiet beneath the blanket of twilight. Shadows lengthened across cobblestone corridors, guarding secrets centuries old.",
  luxury: "True elegance never screams. It resonates in subtle textures, timeless proportions, and an unspoken confidence that demands no validation."
};

const PERSONA_CONFIGS = {
  executive: { rate: 1.05, pitch: 0.95, profileName: 'Executive HQ', preferredGender: 'male', eq: 'studio' },
  cinematic: { rate: 0.85, pitch: 0.80, profileName: 'Cinematic Deep', preferredGender: 'male', eq: 'warm-bass' },
  friendly: { rate: 1.15, pitch: 1.10, profileName: 'Upbeat Commercial', preferredGender: 'female', eq: 'air-treble' },
  'ai-assistant': { rate: 1.00, pitch: 1.05, profileName: 'Precision AI', preferredGender: 'any', eq: 'studio' },
  luxury: { rate: 0.90, pitch: 0.90, profileName: 'Luxury Silk', preferredGender: 'female', eq: 'warm-bass' },
  expressive: { rate: 1.10, pitch: 1.25, profileName: 'Dynamic Anime', preferredGender: 'female', eq: 'radio' }
};

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

// Generate synthesized speech acoustic audio buffer for offline WAV export
async function synthesizeSpeechWaveAudio(text, rate, pitch) {
  const sampleRate = 44100;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const estSeconds = Math.max(1.5, (words.length / (150 * rate)) * 60 + 0.8);
  const totalSamples = Math.ceil(sampleRate * estSeconds);

  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.7, 0);

  // Formant vocal simulator for synthetic master wav
  const baseFreq = 130 * pitch;
  const formants = [
    { freq: baseFreq * 1.0, q: 4.0, gain: 0.6 },
    { freq: 700 * pitch, q: 5.0, gain: 0.4 },
    { freq: 1220 * pitch, q: 6.0, gain: 0.3 },
    { freq: 2600 * pitch, q: 7.0, gain: 0.2 }
  ];

  const osc = offlineCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(baseFreq, 0);

  // Add subtle natural pitch vibrato / jitter
  const lfo = offlineCtx.createOscillator();
  const lfoGain = offlineCtx.createGain();
  lfo.frequency.setValueAtTime(5.2, 0);
  lfoGain.gain.setValueAtTime(baseFreq * 0.02, 0);
  lfo.connect(osc.frequency);
  lfo.start(0);

  // Syllabic envelope modulation matching word rhythm
  const envGain = offlineCtx.createGain();
  envGain.gain.setValueAtTime(0.001, 0);

  const wordInterval = estSeconds / Math.max(1, words.length);
  for (let w = 0; w < words.length; w++) {
    const t0 = w * wordInterval + 0.05;
    const tEnd = t0 + wordInterval * 0.75;
    envGain.gain.setValueAtTime(0.001, t0);
    envGain.gain.linearRampToValueAtTime(0.75, t0 + 0.04);
    envGain.gain.exponentialRampToValueAtTime(0.001, tEnd);
  }

  osc.connect(envGain);

  formants.forEach(f => {
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(f.freq, 0);
    filter.Q.setValueAtTime(f.q, 0);
    const g = offlineCtx.createGain();
    g.gain.setValueAtTime(f.gain, 0);
    envGain.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
  });

  masterGain.connect(offlineCtx.destination);
  osc.start(0);
  osc.stop(estSeconds);
  lfo.stop(estSeconds);

  return await offlineCtx.startRendering();
}

// Canvas Visualizer
function initVisualizer() {
  const canvas = document.getElementById('voice-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let phase = 0;
  function draw() {
    animFrameId = requestAnimationFrame(draw);
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(4, 7, 13, 0.3)';
    ctx.fillRect(0, 0, width, height);

    if (!isSpeaking || isPaused) {
      // Resting subtle pulse line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    phase += 0.08;
    const numBars = 36;
    const barWidth = (width / numBars) * 0.65;
    const gap = (width / numBars) * 0.35;

    for (let i = 0; i < numBars; i++) {
      const norm = i / numBars;
      const wave1 = Math.sin(norm * 8 + phase);
      const wave2 = Math.cos(norm * 14 - phase * 1.5);
      const intensity = Math.abs(wave1 * 0.6 + wave2 * 0.4);
      const barHeight = Math.max(8, intensity * (height * 0.75));

      const x = i * (barWidth + gap) + gap * 0.5;
      const y = (height - barHeight) / 2;

      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#10b981');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 4);
      ctx.fill();
    }
  }
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
  }

  const scriptText = document.getElementById('script-text');
  const scriptCounts = document.getElementById('script-counts');
  const presetScript = document.getElementById('preset-script');

  const voicePersona = document.getElementById('voice-persona');
  const systemVoice = document.getElementById('system-voice');
  const voiceRate = document.getElementById('voice-rate');
  const valRate = document.getElementById('val-rate');
  const voicePitch = document.getElementById('voice-pitch');
  const valPitch = document.getElementById('val-pitch');
  const voiceVolume = document.getElementById('voice-volume');
  const valVolume = document.getElementById('val-volume');
  const voiceEnhancement = document.getElementById('voice-enhancement');

  const btnSpeak = document.getElementById('btn-speak');
  const btnPauseResume = document.getElementById('btn-pause-resume');
  const btnStop = document.getElementById('btn-stop');
  const btnExportWav = document.getElementById('btn-export-wav');
  const btnCopyScript = document.getElementById('btn-copy-script');

  const speechStatus = document.getElementById('speech-status');
  const voiceHint = document.getElementById('voice-hint');
  const teleprompterText = document.getElementById('teleprompter-text');

  const statEngine = document.getElementById('stat-engine');
  const statDuration = document.getElementById('stat-duration');
  const statProfile = document.getElementById('stat-profile');

  initVisualizer();

  function updateCounts() {
    const text = scriptText.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    scriptCounts.textContent = `${words} words | ${chars} chars`;

    const rate = parseFloat(voiceRate.value) || 1.0;
    const estSec = words ? Math.round((words / (140 * rate)) * 60) : 0;
    statDuration.textContent = `~${estSec} sec`;
  }
  scriptText.addEventListener('input', updateCounts);
  updateCounts();

  // Populate Voices from Web Speech API
  function populateVoices() {
    if (!synth) {
      systemVoice.innerHTML = '<option value="">SpeechSynthesis not supported</option>';
      return;
    }
    voices = synth.getVoices();
    if (!voices || voices.length === 0) return;

    systemVoice.innerHTML = '';
    voices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})${v.default ? ' [Default]' : ''}`;
      systemVoice.appendChild(opt);
    });

    if (voices.length > 0) {
      statEngine.textContent = voices[0].name.split(' ')[0] || 'Web Speech';
    }
  }

  populateVoices();
  if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoices;
  }

  // Preset Script Selection
  presetScript.addEventListener('change', () => {
    const val = presetScript.value;
    if (val && SAMPLE_SCRIPTS[val]) {
      scriptText.value = SAMPLE_SCRIPTS[val];
      teleprompterText.textContent = SAMPLE_SCRIPTS[val];
      updateCounts();
    }
  });

  // Persona Preset Selection
  voicePersona.addEventListener('change', () => {
    const p = PERSONA_CONFIGS[voicePersona.value];
    if (p) {
      voiceRate.value = p.rate;
      valRate.textContent = `${p.rate.toFixed(2)}x`;
      voicePitch.value = p.pitch;
      valPitch.textContent = `${p.pitch.toFixed(2)}x`;
      voiceEnhancement.value = p.eq;
      statProfile.textContent = p.profileName;
      updateCounts();
    }
  });

  voiceRate.addEventListener('input', () => {
    valRate.textContent = `${parseFloat(voiceRate.value).toFixed(2)}x`;
    updateCounts();
  });
  voicePitch.addEventListener('input', () => {
    valPitch.textContent = `${parseFloat(voicePitch.value).toFixed(2)}x`;
  });
  voiceVolume.addEventListener('input', () => {
    valVolume.textContent = `${voiceVolume.value}%`;
  });

  systemVoice.addEventListener('change', () => {
    const selIdx = parseInt(systemVoice.value, 10);
    if (voices[selIdx]) {
      statEngine.textContent = voices[selIdx].name.split(' ')[0];
    }
  });

  function stopSpeaking() {
    if (synth) {
      synth.cancel();
    }
    isSpeaking = false;
    isPaused = false;
    speechStatus.textContent = 'Idle';
    speechStatus.style.color = 'var(--text-secondary)';
    btnPauseResume.disabled = true;
    btnPauseResume.textContent = 'Pause';
    btnStop.disabled = true;
  }

  function startSpeaking() {
    const text = scriptText.value.trim();
    if (!text || !synth) return;

    stopSpeaking();

    currentUtterance = new SpeechSynthesisUtterance(text);
    const selIdx = parseInt(systemVoice.value, 10);
    if (voices[selIdx]) {
      currentUtterance.voice = voices[selIdx];
    }
    currentUtterance.rate = parseFloat(voiceRate.value) || 1.0;
    currentUtterance.pitch = parseFloat(voicePitch.value) || 1.0;
    currentUtterance.volume = (parseFloat(voiceVolume.value) || 100) / 100;

    teleprompterText.textContent = text;
    if (voiceHint) voiceHint.style.display = 'none';

    currentUtterance.onstart = () => {
      isSpeaking = true;
      isPaused = false;
      speechStatus.textContent = 'Speaking...';
      speechStatus.style.color = '#10b981';
      btnPauseResume.disabled = false;
      btnPauseResume.textContent = 'Pause';
      btnStop.disabled = false;
    };

    currentUtterance.onboundary = (e) => {
      if (e.name === 'word' || e.name === 'sentence') {
        const charIdx = e.charIndex;
        const before = text.substring(0, charIdx);
        const wordMatch = text.substring(charIdx).match(/\S+/);
        const word = wordMatch ? wordMatch[0] : '';
        const after = text.substring(charIdx + word.length);

        teleprompterText.innerHTML = `${before}<span style="background: rgba(6,182,212,0.3); color: #06b6d4; padding: 0 4px; border-radius: 3px; font-weight: 700;">${word}</span>${after}`;
      }
    };

    currentUtterance.onend = () => {
      isSpeaking = false;
      isPaused = false;
      speechStatus.textContent = 'Finished';
      speechStatus.style.color = 'var(--text-secondary)';
      btnPauseResume.disabled = true;
      btnStop.disabled = true;
      teleprompterText.textContent = text;
    };

    currentUtterance.onerror = (err) => {
      console.warn('Speech error:', err);
      isSpeaking = false;
      speechStatus.textContent = 'Error';
      speechStatus.style.color = 'var(--error)';
      btnPauseResume.disabled = true;
      btnStop.disabled = true;
    };

    synth.speak(currentUtterance);
  }

  btnSpeak.addEventListener('click', startSpeaking);

  btnPauseResume.addEventListener('click', () => {
    if (!synth) return;
    if (isPaused) {
      synth.resume();
      isPaused = false;
      speechStatus.textContent = 'Speaking...';
      speechStatus.style.color = '#10b981';
      btnPauseResume.textContent = 'Pause';
    } else {
      synth.pause();
      isPaused = true;
      speechStatus.textContent = 'Paused';
      speechStatus.style.color = 'var(--accent)';
      btnPauseResume.textContent = 'Resume';
    }
  });

  btnStop.addEventListener('click', stopSpeaking);

  // WAV Export Functionality
  btnExportWav.addEventListener('click', async () => {
    const text = scriptText.value.trim();
    if (!text) return;

    const originalText = btnExportWav.innerHTML;
    btnExportWav.disabled = true;
    btnExportWav.innerHTML = 'Rendering Master WAV...';

    try {
      const rate = parseFloat(voiceRate.value) || 1.0;
      const pitch = parseFloat(voicePitch.value) || 1.0;
      const renderedBuffer = await synthesizeSpeechWaveAudio(text, rate, pitch);
      const wavBlob = audioBufferToWavBlob(renderedBuffer);

      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voiceover-${voicePersona.value || 'speech'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not render audio buffer: ' + err.message);
    } finally {
      btnExportWav.disabled = false;
      btnExportWav.innerHTML = originalText;
    }
  });

  // Copy Script
  btnCopyScript.addEventListener('click', () => {
    navigator.clipboard.writeText(scriptText.value.trim()).then(() => {
      const original = btnCopyScript.textContent;
      btnCopyScript.textContent = 'Copied!';
      setTimeout(() => { btnCopyScript.textContent = original; }, 1500);
    });
  });
});