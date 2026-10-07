// Product Voiceover Studio - Engine

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

// SCRIPT GENERATOR TEMPLATES
const SCRIPT_TEMPLATES = {
  tech: {
    15: "Meet {product}. Engineered with {benefit}. Experience future-grade precision today. {cta}.",
    30: "Ready to elevate the way you work and live? Meet {product} from {brand}. Featuring {benefit}, it delivers unmatched power in a seamless, ultralight form. Upgrade your everyday setup. {cta}.",
    60: "What if technology simply got out of your way? Introducing {product} by {brand}. We spent years perfecting every millimeter to deliver {benefit}. From intuitive controls to all-day endurance, it adapts effortlessly to your lifestyle. Don't settle for ordinary performance. {cta}."
  },
  luxury: {
    15: "True elegance demands no explanation. Discover {product} by {brand}. Defined by {benefit}. {cta}.",
    30: "In a world of noise, true luxury is quiet confidence. Introducing {product} by {brand}. Impeccably crafted with {benefit}, every detail reflects singular dedication to perfection. Claim your masterpiece. {cta}.",
    60: "Craftsmanship is not merely an art; it is a sacred promise. {brand} presents {product}. Meticulously sculpted and infused with {benefit}, it is a transcendent tribute to modern prestige. For those who seek the extraordinary in every single moment. {cta}."
  },
  fitness: {
    15: "Crush your limits with {product}. Built for performance with {benefit}. Level up now. {cta}!",
    30: "Your goals don't wait, and neither should you. Introducing {product} from {brand}. Designed with {benefit}, it keeps you moving faster, stronger, and longer. Unleash your full potential today. {cta}!",
    60: "Every champion starts with a single decision. Meet {product} by {brand}. Engineered for relentless athletes, it features {benefit} to push you past every barrier you face. Whatever your mountain, conquer it with confidence. Stop making excuses and start winning. {cta}!"
  },
  home: {
    15: "Simplify your everyday routine with {product}. Featuring {benefit}. Make your home feel like home. {cta}.",
    30: "Life at home should be effortless. That's why {brand} created {product}. With {benefit}, you spend less time on chores and more time doing what you love with family. Experience the comfort difference today. {cta}.",
    60: "Your home is your sanctuary, and it deserves thoughtful care. Discover {product} by {brand}. Thoughtfully designed with {benefit}, it brings effortless calm and modern beauty to every room. Join thousands of happy homes across the globe. {cta}."
  },
  food: {
    15: "Indulge in pure flavor with {product}. Crafted with {benefit}. Taste the difference. {cta}!",
    30: "Craving something extraordinary? Discover {product} by {brand}. Made with {benefit}, each bite is an explosion of rich, artisanal flavor. Treat your senses to something truly mouthwatering. {cta}!",
    60: "Great moments begin with exceptional taste. Introducing {product} by {brand}. We source the finest ingredients, perfected with {benefit} to deliver an unforgettable gourmet experience. Whether celebrating a milestone or sharing with friends, savor perfection. {cta}!"
  },
  saas: {
    15: "Scale your workflow effortlessly with {product}. Powered by {benefit}. Start your free trial today. {cta}.",
    30: "Stop wasting hours on manual bottlenecks. Meet {product} by {brand}. With {benefit}, your entire team can collaborate, automate tasks, and ship results twice as fast. Work smarter, not harder. {cta}.",
    60: "In today's fast-moving business world, speed and precision decide everything. {brand} built {product} to streamline your operations with {benefit}. Connect your teams, unlock deep analytics, and eliminate friction with one unified platform. Transform your enterprise today. {cta}."
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let bgmGainNode = null;
  let bgmOscillators = [];
  let isPlayingAll = false;
  let meterInterval = null;

  // DOM
  const productCategory = document.getElementById('productCategory');
  const scriptDuration = document.getElementById('scriptDuration');
  const brandName = document.getElementById('brandName');
  const productName = document.getElementById('productName');
  const keyBenefit = document.getElementById('keyBenefit');
  const callToAction = document.getElementById('callToAction');
  const scriptText = document.getElementById('scriptText');
  const scriptWordCount = document.getElementById('scriptWordCount');

  const voiceSelect = document.getElementById('voiceSelect');
  const voicePitch = document.getElementById('voicePitch');
  const voiceRate = document.getElementById('voiceRate');
  const pitchDisp = document.getElementById('pitchDisp');
  const rateDisp = document.getElementById('rateDisp');
  const musicStyle = document.getElementById('musicStyle');
  const bgmVolume = document.getElementById('bgmVolume');
  const bgmVolDisp = document.getElementById('bgmVolDisp');
  const chkAutoDuck = document.getElementById('chkAutoDuck');

  const btnPlayAll = document.getElementById('btnPlayAll');
  const btnStopAll = document.getElementById('btnStopAll');
  const btnDownloadTrack = document.getElementById('btnDownloadTrack');

  const voiceMeter = document.getElementById('voiceMeter');
  const musicMeter = document.getElementById('musicMeter');
  const voiceDb = document.getElementById('voiceDb');
  const musicDb = document.getElementById('musicDb');
  const duckStatus = document.getElementById('duckStatus');

  // Populate Voices
  let voices = [];
  function populateVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '<option value="">Default System Voice</option>';
    voices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });
  }
  populateVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Update Script Text
  function updateScript() {
    const cat = productCategory.value;
    const dur = scriptDuration.value;
    const template = (SCRIPT_TEMPLATES[cat] && SCRIPT_TEMPLATES[cat][dur]) || SCRIPT_TEMPLATES.tech[30];

    const rendered = template
      .replace(/{brand}/g, brandName.value.trim() || 'Our Brand')
      .replace(/{product}/g, productName.value.trim() || 'Our Product')
      .replace(/{benefit}/g, keyBenefit.value.trim() || 'leading technology')
      .replace(/{cta}/g, callToAction.value.trim() || 'Visit our website today');

    scriptText.value = rendered;
    updateWordCount();
  }

  function updateWordCount() {
    const text = scriptText.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const estSec = Math.round(words / 2.3);
    scriptWordCount.textContent = `${words} words (~${estSec}s)`;
  }

  [productCategory, scriptDuration, brandName, productName, keyBenefit, callToAction].forEach(el => {
    el.addEventListener('input', updateScript);
  });
  scriptText.addEventListener('input', updateWordCount);

  voicePitch.addEventListener('input', () => { pitchDisp.textContent = `${parseFloat(voicePitch.value).toFixed(2)}x`; });
  voiceRate.addEventListener('input', () => { rateDisp.textContent = `${parseFloat(voiceRate.value).toFixed(2)}x`; });
  bgmVolume.addEventListener('input', () => {
    bgmVolDisp.textContent = `${bgmVolume.value}%`;
    if (bgmGainNode && audioCtx && !isPlayingAll) {
      bgmGainNode.gain.setValueAtTime((bgmVolume.value / 100) * 0.35, audioCtx.currentTime);
    }
  });

  // Audio Engine
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

  // Play Procedural Music Bed
  function startMusicBed(ctx, style, customDestination = null) {
    stopMusicBed();
    if (style === 'none') return;

    const dest = customDestination || ctx.destination;
    const masterGain = ctx.createGain();
    const targetVol = (bgmVolume.value / 100) * 0.35;
    masterGain.gain.setValueAtTime(targetVol, ctx.currentTime);
    bgmGainNode = masterGain;
    masterGain.connect(dest);

    // Style chords / frequencies
    let chords = [];
    if (style === 'upbeat_tech') {
      chords = [
        [261.63, 329.63, 392.00], // C maj
        [293.66, 349.23, 440.00], // D min
        [329.63, 392.00, 493.88], // E min
        [349.23, 440.00, 523.25]  // F maj
      ];
    } else if (style === 'lofi_chill') {
      chords = [
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23]  // G7
      ];
    } else if (style === 'cinematic') {
      chords = [
        [130.81, 196.00, 261.63], // C power
        [146.83, 220.00, 293.66], // D
        [164.81, 246.94, 329.63]  // E
      ];
    } else {
      // acoustic_bright
      chords = [
        [261.63, 329.63, 392.00],
        [196.00, 246.94, 293.66],
        [220.00, 261.63, 329.63]
      ];
    }

    // Play evolving arpeggiated loop
    const stepTime = 0.45;
    let chordIdx = 0;
    const now = ctx.currentTime + 0.05;

    // Create 12 beats loop
    for (let bar = 0; bar < 20; bar++) {
      const currentChord = chords[bar % chords.length];
      currentChord.forEach((note, nIdx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = (style === 'lofi_chill') ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(note, now + bar * stepTime + nIdx * 0.12);

        const noteStart = now + bar * stepTime + nIdx * 0.12;
        const noteEnd = noteStart + stepTime * 1.5;

        noteGain.gain.setValueAtTime(0, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.12, noteStart + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(noteStart);
        osc.stop(noteEnd);
        bgmOscillators.push(osc);
      });
    }
  }

  function stopMusicBed() {
    bgmOscillators.forEach(osc => {
      try { osc.stop(); } catch(e){}
    });
    bgmOscillators = [];
  }

  // Play Commercial Voiceover with Ducking
  function playCommercial() {
    stopAll();
    const ctx = getAudioContext();
    isPlayingAll = true;

    // Start BGM bed
    startMusicBed(ctx, musicStyle.value);

    // Apply auto ducking: drop BGM volume while speech is active
    if (chkAutoDuck.checked && bgmGainNode) {
      const normalVol = (bgmVolume.value / 100) * 0.35;
      const duckedVol = normalVol * 0.35; // 65% reduction
      bgmGainNode.gain.setTargetAtTime(duckedVol, ctx.currentTime + 0.2, 0.15);
      duckStatus.textContent = 'DUCKING: ACTIVE (-10 dB DUCK)';
      duckStatus.style.background = 'rgba(0, 229, 255, 0.2)';
      duckStatus.style.color = '#00e5ff';
    }

    // Start voiceover
    const script = scriptText.value.trim();
    if (script && ('speechSynthesis' in window)) {
      const utter = new SpeechSynthesisUtterance(script);
      utter.rate = parseFloat(voiceRate.value) || 1.0;
      utter.pitch = parseFloat(voicePitch.value) || 1.0;

      if (voiceSelect.value !== '' && voices[voiceSelect.value]) {
        utter.voice = voices[voiceSelect.value];
      }

      utter.onend = () => {
        // Restore BGM level smoothly
        if (bgmGainNode && audioCtx) {
          const normalVol = (bgmVolume.value / 100) * 0.35;
          bgmGainNode.gain.setTargetAtTime(normalVol, audioCtx.currentTime, 0.3);
          duckStatus.textContent = 'DUCKING ENGINE: STANDBY';
          duckStatus.style.background = 'rgba(255, 179, 0, 0.15)';
          duckStatus.style.color = '#ffb300';
        }
        isPlayingAll = false;
      };

      utter.onerror = () => {
        isPlayingAll = false;
      };

      window.speechSynthesis.speak(utter);
    }

    startMeters();
  }

  function stopAll() {
    isPlayingAll = false;
    stopMusicBed();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearInterval(meterInterval);
    voiceMeter.style.width = '0%';
    musicMeter.style.width = '0%';
    voiceDb.textContent = '-inf dB';
    musicDb.textContent = '-inf dB';
    duckStatus.textContent = 'DUCKING ENGINE: READY';
  }

  function startMeters() {
    clearInterval(meterInterval);
    meterInterval = setInterval(() => {
      if (!isPlayingAll) {
        voiceMeter.style.width = '0%';
        musicMeter.style.width = '0%';
        return;
      }
      // Voice meter
      const vVal = Math.random() * 45 + 50;
      voiceMeter.style.width = `${vVal}%`;
      voiceDb.textContent = `-${Math.round((100 - vVal) * 0.2)} dB`;

      // Music meter (ducked or full)
      const isDucked = chkAutoDuck.checked;
      const mVal = isDucked ? (Math.random() * 20 + 20) : (Math.random() * 30 + 55);
      musicMeter.style.width = `${mVal}%`;
      musicDb.textContent = `-${Math.round((100 - mVal) * 0.25)} dB`;
    }, 120);
  }

  btnPlayAll.addEventListener('click', playCommercial);
  btnStopAll.addEventListener('click', stopAll);

  // Download BGM Bed WAV
  btnDownloadTrack.addEventListener('click', async () => {
    btnDownloadTrack.disabled = true;
    btnDownloadTrack.innerHTML = '<span>Rendering BGM Bed...</span>';

    try {
      const sampleRate = 44100;
      const duration = 12.0;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * duration, sampleRate);

      startMusicBed(offlineCtx, musicStyle.value === 'none' ? 'upbeat_tech' : musicStyle.value, offlineCtx.destination);

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product_bgm_bed_${productCategory.value}_${musicStyle.value}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error rendering audio: ' + e.message);
    } finally {
      btnDownloadTrack.disabled = false;
      btnDownloadTrack.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Download BGM Bed (WAV)</span>
      `;
    }
  });

  // Init
  updateScript();
});