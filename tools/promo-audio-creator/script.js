// Promo Audio & Teaser Creator - Engine

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

const HOOK_PRESETS = {
  stop_scrolling: {
    brand: "GrowthLab",
    offer: "unlock the exact secret formula to 10k engaged followers",
    script: "Stop scrolling! If you're still posting randomly every day and hoping for views, you're throwing away time. {brand} just released a game changer: {offer}. Link in bio to access before it's gone!"
  },
  three_secrets: {
    brand: "StudioForge",
    offer: "automate 80 percent of your manual video editing",
    script: "Here are 3 secret tools that top creators never tell you about. Number 1: automated caption generation. Number 2: algorithmic pacing. And Number 3, from {brand}: {offer}. Save this reel right now so you don't lose it!"
  },
  flash_sale: {
    brand: "LuxeVibe",
    offer: "50% off storewide for the next 24 hours only",
    script: "Emergency flash sale alert! For the next twenty-four hours only, {brand} is unlocking {offer}. Tap the link below right now and claim your code before stock sells out!"
  },
  vip_early_drop: {
    brand: "Quantum Gear",
    offer: "early access passes for our limited edition drop",
    script: "This is not a drill. VIP early access is officially live for {brand}. If you're on the insider list, you can now {offer}. Do not wait—once the timer hits zero, doors close!"
  },
  unpopular_opinion: {
    brand: "CreatorAcademy",
    offer: "the proven high-conversion organic framework",
    script: "Unpopular opinion: You don't need expensive gear to make six figures online. What you really need is {offer} from {brand}. Check the link in the bio to see the breakdown!"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let activeNodes = [];
  let isPlaying = false;
  let tensionInterval = null;

  // DOM
  const hookPreset = document.getElementById('hookPreset');
  const promoBrand = document.getElementById('promoBrand');
  const promoOffer = document.getElementById('promoOffer');
  const promoScript = document.getElementById('promoScript');
  const riserDuration = document.getElementById('riserDuration');

  const promoVoiceSelect = document.getElementById('promoVoiceSelect');
  const promoVoiceRate = document.getElementById('promoVoiceRate');
  const promoVoicePitch = document.getElementById('promoVoicePitch');
  const promoRateDisp = document.getElementById('promoRateDisp');
  const promoPitchDisp = document.getElementById('promoPitchDisp');

  const chkSubDrop = document.getElementById('chkSubDrop');
  const chkPulseBed = document.getElementById('chkPulseBed');

  const btnPlayPromo = document.getElementById('btnPlayPromo');
  const btnTriggerRiser = document.getElementById('btnTriggerRiser');
  const btnStopPromo = document.getElementById('btnStopPromo');
  const btnDownloadPromoWav = document.getElementById('btnDownloadPromoWav');

  const tensionFill = document.getElementById('tensionFill');
  const tensionStatus = document.getElementById('tensionStatus');

  // Populate Voices
  let voices = [];
  function populateVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    promoVoiceSelect.innerHTML = '<option value="">Default System Voice</option>';
    voices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})`;
      promoVoiceSelect.appendChild(opt);
    });
  }
  populateVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Update Script Template
  function updateScript() {
    const p = HOOK_PRESETS[hookPreset.value] || HOOK_PRESETS.stop_scrolling;
    promoBrand.value = p.brand;
    promoOffer.value = p.offer;
    renderText();
  }

  function renderText() {
    const p = HOOK_PRESETS[hookPreset.value] || HOOK_PRESETS.stop_scrolling;
    const rendered = p.script
      .replace(/{brand}/g, promoBrand.value.trim() || 'Our Brand')
      .replace(/{offer}/g, promoOffer.value.trim() || 'exclusive offer');
    promoScript.value = rendered;
  }

  hookPreset.addEventListener('change', updateScript);
  [promoBrand, promoOffer].forEach(el => el.addEventListener('input', renderText));

  promoVoiceRate.addEventListener('input', () => { promoRateDisp.textContent = `${parseFloat(promoVoiceRate.value).toFixed(2)}x`; });
  promoVoicePitch.addEventListener('input', () => { promoPitchDisp.textContent = `${parseFloat(promoVoicePitch.value).toFixed(2)}x`; });

  // Web Audio Context
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

  // Synthesize Pitch Riser
  function playRiser(ctx, duration, dest) {
    const now = ctx.currentTime;

    // Filtered noise riser
    const bufSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 4.0;
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(7500, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(now);
    noise.stop(now + duration + 0.1);
    activeNodes.push(noise);

    // Ascending Saw Pitch
    const saw = ctx.createOscillator();
    const sawGain = ctx.createGain();
    saw.type = 'sawtooth';
    saw.frequency.setValueAtTime(120, now);
    saw.frequency.exponentialRampToValueAtTime(880, now + duration);

    sawGain.gain.setValueAtTime(0.01, now);
    sawGain.gain.exponentialRampToValueAtTime(0.2, now + duration);

    saw.connect(sawGain);
    sawGain.connect(dest);

    saw.start(now);
    saw.stop(now + duration + 0.05);
    activeNodes.push(saw);

    // Animate UI Tension bar
    animateTension(duration);
  }

  // Synthesize Bass Impact Drop
  function playDrop(ctx, startTime, dest) {
    // 808 Sub Boom
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(32, startTime + 1.2);

    g.gain.setValueAtTime(0.65, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + 1.4);

    osc.connect(g);
    g.connect(dest);
    osc.start(startTime);
    osc.stop(startTime + 1.5);
    activeNodes.push(osc);

    // Snare crash
    const crashLen = ctx.sampleRate * 0.8;
    const crashBuf = ctx.createBuffer(1, crashLen, ctx.sampleRate);
    const d = crashBuf.getChannelData(0);
    for (let i = 0; i < crashLen; i++) d[i] = Math.random() * 2 - 1;
    const crashSrc = ctx.createBufferSource();
    crashSrc.buffer = crashBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1200;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.25, startTime);
    cg.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);
    crashSrc.connect(hp);
    hp.connect(cg);
    cg.connect(dest);
    crashSrc.start(startTime);
    activeNodes.push(crashSrc);
  }

  // Synthesize Driving Pulse Bed
  function playPulseBed(ctx, startTime, dest) {
    const bpm = 126;
    const step = 60 / bpm / 2; // 16th notes
    for (let i = 0; i < 24; i++) {
      const t = startTime + i * step;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = (i % 4 === 0) ? 65.41 : 130.81; // C2 / C3
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.15);
      activeNodes.push(osc);
    }
  }

  function animateTension(duration) {
    clearInterval(tensionInterval);
    const startTime = performance.now();
    tensionStatus.textContent = 'BUILDING TENSION...';
    tensionStatus.style.color = '#a855f7';

    tensionInterval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(100, (elapsed / duration) * 100);
      tensionFill.style.width = `${progress}%`;

      if (progress >= 100) {
        clearInterval(tensionInterval);
        tensionStatus.textContent = '💥 THE DROP!';
        tensionStatus.style.color = '#ef4444';
        setTimeout(() => {
          tensionStatus.textContent = 'HOOK DELIVERED';
          tensionStatus.style.color = '#00e676';
        }, 1500);
      }
    }, 30);
  }

  // Play Full Promo
  function playFullPromo() {
    stopPromo();
    const ctx = getAudioContext();
    isPlaying = true;
    const riserDur = parseFloat(riserDuration.value) || 3.5;

    // Start Riser
    playRiser(ctx, riserDur, ctx.destination);

    // Schedule Drop
    const dropTime = ctx.currentTime + riserDur;
    if (chkSubDrop.checked) {
      playDrop(ctx, dropTime, ctx.destination);
    }

    if (chkPulseBed.checked) {
      playPulseBed(ctx, dropTime, ctx.destination);
    }

    // Voiceover begins exactly at drop
    const script = promoScript.value.trim();
    if (script && ('speechSynthesis' in window)) {
      const utter = new SpeechSynthesisUtterance(script);
      utter.rate = parseFloat(promoVoiceRate.value) || 1.1;
      utter.pitch = parseFloat(promoVoicePitch.value) || 1.05;

      if (promoVoiceSelect.value !== '' && voices[promoVoiceSelect.value]) {
        utter.voice = voices[promoVoiceSelect.value];
      }

      utter.onend = () => { isPlaying = false; };
      utter.onerror = () => { isPlaying = false; };

      setTimeout(() => {
        if (isPlaying) window.speechSynthesis.speak(utter);
      }, riserDur * 1000);
    }
  }

  function stopPromo() {
    isPlaying = false;
    clearInterval(tensionInterval);
    tensionFill.style.width = '0%';
    tensionStatus.textContent = 'READY FOR BUILDUP';
    tensionStatus.style.color = '#ec4899';

    activeNodes.forEach(n => { try { n.stop(); } catch(e){} });
    activeNodes = [];

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  btnPlayPromo.addEventListener('click', playFullPromo);
  btnTriggerRiser.addEventListener('click', () => {
    stopPromo();
    const ctx = getAudioContext();
    const dur = parseFloat(riserDuration.value) || 3.5;
    playRiser(ctx, dur, ctx.destination);
    setTimeout(() => {
      playDrop(ctx, ctx.currentTime, ctx.destination);
    }, dur * 1000);
  });
  btnStopPromo.addEventListener('click', stopPromo);

  // Download Promo Track WAV
  btnDownloadPromoWav.addEventListener('click', async () => {
    btnDownloadPromoWav.disabled = true;
    btnDownloadPromoWav.innerHTML = '<span>Rendering Audio...</span>';

    try {
      const sampleRate = 44100;
      const riserDur = parseFloat(riserDuration.value) || 3.5;
      const totalDur = riserDur + 6.0;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * totalDur, sampleRate);

      playRiser(offlineCtx, riserDur, offlineCtx.destination);
      playDrop(offlineCtx, riserDur, offlineCtx.destination);
      playPulseBed(offlineCtx, riserDur, offlineCtx.destination);

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promo_riser_drop_${hookPreset.value}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error rendering audio: ' + e.message);
    } finally {
      btnDownloadPromoWav.disabled = false;
      btnDownloadPromoWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>
        <span>Download Promo Track (WAV)</span>
      `;
    }
  });

  // Init
  updateScript();
});