// Advertisement Audio Studio - Engine

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

const AD_TEMPLATES = {
  flash_sale: {
    sponsor: "SuperStore Retail",
    offer: "Up to 70% off storewide and doorbuster deals",
    text: "[SOUND: ALERT] Attention shoppers! The monster weekend clearance event is officially on at {sponsor}! For forty-eight hours only, take advantage of {offer}. [SOUND: CHA-CHING] But hurry—once the doors close Sunday night, these legendary savings are gone forever. Visit {sponsor} today!"
  },
  luxury_auto: {
    sponsor: "Apex Motors",
    offer: "0% APR financing plus two thousand dollars bonus cash",
    text: "[SOUND: WHOOSH] Perfection isn't achieved by adding more—it's realized when nothing more can be taken away. Introducing the all-new flagship from {sponsor}. Experience breathtaking craftsmanship, electrified performance, and {offer}. [SOUND: SUB-DROP] The open road is calling. Test drive today at {sponsor}."
  },
  podcast_sponsor: {
    sponsor: "CloudShield VPN",
    offer: "three months free with promo code PODCAST",
    text: "Before we get back to today's conversation, a quick word from our sponsor, {sponsor}. In today's digital world, protecting your online identity and personal data is essential. With military-grade encryption and ultra-fast servers across ninety countries, {sponsor} keeps your connection airtight. Get {offer} when you sign up at their website today."
  },
  food_delivery: {
    sponsor: "FastBite Delivery",
    offer: "Free delivery on your first three orders",
    text: "[SOUND: BELL] Hungry? Don't settle for lukewarm leftovers. With {sponsor}, order from your favorite top-rated local restaurants and enjoy sizzling, chef-prepared meals delivered hot to your door in thirty minutes or less! [SOUND: CHA-CHING] Use code FASTBITE for {offer}. Tap the app and eat well tonight!"
  },
  travel_escape: {
    sponsor: "Azure Horizon Resorts",
    offer: "Complimentary room upgrade and spa credit",
    text: "[SOUND: WHOOSH] Trade your crowded commute for turquoise waters and warm ocean breezes. Escape to {sponsor}. Whether you're unwinding in private overwater villas or dining under the stars, your dream vacation awaits. Book this week and receive {offer}. {sponsor}: your sanctuary in paradise."
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let bgmGainNode = null;
  let activeOscs = [];
  let isPlaying = false;

  // DOM
  const adTheme = document.getElementById('adTheme');
  const sponsorName = document.getElementById('sponsorName');
  const adOffer = document.getElementById('adOffer');
  const adScriptText = document.getElementById('adScriptText');
  const adTimerEst = document.getElementById('adTimerEst');

  const adBeatStyle = document.getElementById('adBeatStyle');
  const adVoiceSelect = document.getElementById('adVoiceSelect');
  const adVoiceRate = document.getElementById('adVoiceRate');
  const adVoicePitch = document.getElementById('adVoicePitch');
  const adRateDisp = document.getElementById('adRateDisp');
  const adPitchDisp = document.getElementById('adPitchDisp');
  const adBedVol = document.getElementById('adBedVol');
  const adBedVolDisp = document.getElementById('adBedVolDisp');

  const chkIntroStinger = document.getElementById('chkIntroStinger');
  const chkOutroBooster = document.getElementById('chkOutroBooster');

  const btnPlayAd = document.getElementById('btnPlayAd');
  const btnStopAd = document.getElementById('btnStopAd');
  const btnDownloadAdWav = document.getElementById('btnDownloadAdWav');

  // Populate Voices
  let voices = [];
  function populateVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    adVoiceSelect.innerHTML = '<option value="">Default System Voice</option>';
    voices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})`;
      adVoiceSelect.appendChild(opt);
    });
  }
  populateVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

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

  // Synthesize Sound Effects
  function playSFX(type, customCtx = null, destination = null) {
    const ctx = customCtx || getAudioContext();
    const dest = destination || ctx.destination;
    const now = ctx.currentTime;

    switch (type) {
      case 'sub_drop': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 1.25);
        break;
      }
      case 'cha_ching': {
        // Bell 1 & 2
        [1975, 2960].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.25, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
          osc.connect(g);
          g.connect(dest);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.65);
        });
        break;
      }
      case 'whoosh': {
        const bufferSize = ctx.sampleRate * 0.6;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 3.0;
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.3);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.6);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.6);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(now);
        noise.stop(now + 0.65);
        break;
      }
      case 'bell_stinger': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
        g.gain.setValueAtTime(0.35, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(g);
        g.connect(dest);
        osc.start(now);
        osc.stop(now + 0.85);
        break;
      }
      case 'cheer': {
        const bufLen = ctx.sampleRate * 1.5;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const out = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) out[i] = (Math.random() * 2 - 1) * 0.2;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 800;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        src.connect(hp);
        hp.connect(g);
        g.connect(dest);
        src.start(now);
        break;
      }
      case 'alert': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(660, now + 0.15);
        osc.frequency.setValueAtTime(880, now + 0.3);
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(g);
        g.connect(dest);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }
    }
  }

  // SFX Buttons Listener
  document.querySelectorAll('.sfx-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSFX(btn.dataset.sfx);
    });
  });

  // Template Update
  function updateTemplate() {
    const tmpl = AD_TEMPLATES[adTheme.value] || AD_TEMPLATES.flash_sale;
    sponsorName.value = tmpl.sponsor;
    adOffer.value = tmpl.offer;
    renderScript();
  }

  function renderScript() {
    const tmpl = AD_TEMPLATES[adTheme.value] || AD_TEMPLATES.flash_sale;
    let s = tmpl.text
      .replace(/{sponsor}/g, sponsorName.value.trim() || 'Our Sponsor')
      .replace(/{offer}/g, adOffer.value.trim() || 'special limited discount');
    adScriptText.value = s;
    updateDurationEst();
  }

  function updateDurationEst() {
    const plain = adScriptText.value.replace(/\[SOUND:.*?\]/g, '').trim();
    const words = plain ? plain.split(/\s+/).length : 0;
    const sec = Math.round(words / 2.4);
    adTimerEst.textContent = `~${sec} seconds (${words} words)`;
  }

  adTheme.addEventListener('change', updateTemplate);
  [sponsorName, adOffer].forEach(el => el.addEventListener('input', renderScript));
  adScriptText.addEventListener('input', updateDurationEst);

  adVoiceRate.addEventListener('input', () => { adRateDisp.textContent = `${parseFloat(adVoiceRate.value).toFixed(2)}x`; });
  adVoicePitch.addEventListener('input', () => { adPitchDisp.textContent = `${parseFloat(adVoicePitch.value).toFixed(2)}x`; });
  adBedVol.addEventListener('input', () => { adBedVolDisp.textContent = `${adBedVol.value}%`; });

  // Synthesize Commercial Backing Beat
  function startCommercialBeat(ctx, dest) {
    stopBeat();
    const masterGain = ctx.createGain();
    const vol = (adBedVol.value / 100) * 0.3;
    masterGain.gain.setValueAtTime(vol, ctx.currentTime);
    bgmGainNode = masterGain;
    masterGain.connect(dest);

    const now = ctx.currentTime + 0.05;
    const bpm = 120;
    const beatSec = 60 / bpm;

    // Generate 16 bars of upbeat driving rhythm
    for (let bar = 0; bar < 16; bar++) {
      const barTime = now + bar * beatSec * 2;

      // Kick drum pulse
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(130, barTime);
      kickOsc.frequency.exponentialRampToValueAtTime(45, barTime + 0.15);
      kickGain.gain.setValueAtTime(0.4, barTime);
      kickGain.gain.exponentialRampToValueAtTime(0.001, barTime + 0.2);
      kickOsc.connect(kickGain);
      kickGain.connect(masterGain);
      kickOsc.start(barTime);
      kickOsc.stop(barTime + 0.25);
      activeOscs.push(kickOsc);

      // Synth chord stab
      [330, 392, 493.88].forEach(freq => {
        const chordOsc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        chordOsc.type = 'sawtooth';
        chordOsc.frequency.setValueAtTime(freq, barTime + beatSec);
        chordGain.gain.setValueAtTime(0.08, barTime + beatSec);
        chordGain.gain.exponentialRampToValueAtTime(0.001, barTime + beatSec + 0.25);
        chordOsc.connect(chordGain);
        chordGain.connect(masterGain);
        chordOsc.start(barTime + beatSec);
        chordOsc.stop(barTime + beatSec + 0.3);
        activeOscs.push(chordOsc);
      });
    }
  }

  function stopBeat() {
    activeOscs.forEach(o => { try { o.stop(); } catch(e){} });
    activeOscs = [];
  }

  // Broadcast Full Ad
  function playFullAd() {
    stopAd();
    const ctx = getAudioContext();
    isPlaying = true;

    // Intro Stinger
    if (chkIntroStinger.checked) {
      playSFX('whoosh', ctx, ctx.destination);
    }

    // Start commercial beat
    startCommercialBeat(ctx, ctx.destination);

    // Speak Script (with sound cues parsed)
    const raw = adScriptText.value;
    const speechText = raw.replace(/\[SOUND:.*?\]/g, '').trim();

    if (speechText && ('speechSynthesis' in window)) {
      const utter = new SpeechSynthesisUtterance(speechText);
      utter.rate = parseFloat(adVoiceRate.value) || 1.05;
      utter.pitch = parseFloat(adVoicePitch.value) || 1.0;

      if (adVoiceSelect.value !== '' && voices[adVoiceSelect.value]) {
        utter.voice = voices[adVoiceSelect.value];
      }

      utter.onend = () => {
        if (chkOutroBooster.checked && isPlaying) {
          playSFX('cha_ching', ctx, ctx.destination);
        }
        isPlaying = false;
      };

      utter.onerror = () => {
        isPlaying = false;
      };

      setTimeout(() => {
        if (isPlaying) window.speechSynthesis.speak(utter);
      }, chkIntroStinger.checked ? 400 : 50);
    }
  }

  function stopAd() {
    isPlaying = false;
    stopBeat();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  btnPlayAd.addEventListener('click', playFullAd);
  btnStopAd.addEventListener('click', stopAd);

  // Download Commercial Track WAV
  btnDownloadAdWav.addEventListener('click', async () => {
    btnDownloadAdWav.disabled = true;
    btnDownloadAdWav.innerHTML = '<span>Rendering Audio...</span>';

    try {
      const sampleRate = 44100;
      const duration = 15.0;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * duration, sampleRate);

      // Intro whoosh
      playSFX('whoosh', offlineCtx, offlineCtx.destination);
      // Backing beat
      startCommercialBeat(offlineCtx, offlineCtx.destination);
      // Mid stinger
      setTimeout(() => playSFX('cha_ching', offlineCtx, offlineCtx.destination), 5000);

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `advertisement_audio_${adTheme.value}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error rendering audio: ' + e.message);
    } finally {
      btnDownloadAdWav.disabled = false;
      btnDownloadAdWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Download Commercial Track (WAV)</span>
      `;
    }
  });

  // Init
  updateTemplate();
});