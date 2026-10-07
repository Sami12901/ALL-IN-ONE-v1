// Umrah Guide Audio & Talbiyah Suite - Client-Side Engine

function bufferToWave(abuffer, len) {
  const numOfChan = abuffer.numberOfChannels;
  const length = (len || abuffer.length) * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels = [], i, sample, offset = 0, pos = 0;

  function writeString(s) {
    for (let j = 0; j < s.length; j++) out.setUint8(pos++, s.charCodeAt(j));
  }
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

const RITUAL_STEPS = [
  {
    stage: 'STAGE 1 • IHRAM & NIYYAH',
    ref: 'At Miqat boundary before entering Makkah',
    arabic: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً',
    translit: "Labbayk Allāhumma 'Umrah",
    transl: 'Here I am, O Allah, answering Your call to perform Umrah.',
    instructions: 'Perform Ghusl (ritual purification), apply perfume to the body (not garments), put on the two unstitched white towels (for men), pray two Raka\'ah Sunnah if convenient, and declare your Niyyah (intention) at the Miqat.'
  },
  {
    stage: 'STAGE 2 • TALBIYAH',
    ref: 'Recited continuously from Miqat until sighting the Kaaba',
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لاَ شَرِيكَ لَكَ',
    translit: 'Labbayk Allāhumma labbayk, labbayka lā sharīka laka labbayk, innal-ḥamda wan-ni‘mata laka wal-mulk, lā sharīka lak.',
    transl: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise, grace, and sovereignty belong to You. You have no partner.',
    instructions: 'Recite the Talbiyah aloud (for men) and softly (for women) with deep contemplation and humility throughout the journey towards the Holy Mosque in Makkah.'
  },
  {
    stage: 'STAGE 3 • ENTERING MASJID AL-HARAM',
    ref: 'Du’a upon entering through the gates of the sanctuary',
    arabic: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    translit: 'Bismillāh, waṣ-ṣalātu was-salāmu ‘alā Rasūlillāh, Allāhummagh-fir lī dhunūbī waf-taḥ lī abwāba raḥmatik.',
    transl: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, forgive my sins and open the gates of Your mercy for me.',
    instructions: 'Enter with your right foot first. When your eyes first behold the Holy Kaaba, pause, make Takbeer (Allahu Akbar) and Tahlil (La ilaha illallah), and make sincere personal supplications, as prayers upon first viewing the Kaaba are answered.'
  },
  {
    stage: 'STAGE 4 • TAWAF (CIRCUIT AROUND KAABA)',
    ref: '7 Counter-Clockwise Circumambulations starting at Black Stone',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    translit: 'Rabbanā ātinā fid-dunyā ḥasanatan wa fīl-ākhirati ḥasanatan wa qinā ‘adhāban-nār.',
    transl: 'Our Lord! Give us in this world that which is good and in the Hereafter that which is good, and save us from the torment of the Fire. (Surah Al-Baqarah 2:201)',
    instructions: 'Expose your right shoulder (Idtiba for men). Start at Hajar al-Aswad pointing your right hand and saying "Bismillahi Allahu Akbar". Complete 7 full circuits. Between the Yemeni Corner (Rukn al-Yamani) and the Black Stone, recite the du’a above.'
  },
  {
    stage: 'STAGE 5 • MAQAM IBRAHIM & ZAMZAM',
    ref: 'Behind the Station of Prophet Ibrahim (AS)',
    arabic: 'وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى',
    translit: 'Wattakhidhū mim-maqāmi Ibrāhīma muṣallā.',
    transl: 'And take the Station of Abraham as a place of prayer. (Surah Al-Baqarah 2:125)',
    instructions: 'Proceed behind Maqam Ibrahim (or any accessible area in the Haram) and pray 2 light Raka\'ah (Surah Al-Kafirun in the 1st, Surah Al-Ikhlas in the 2nd). Then proceed to drink Zamzam water facing the Kaaba.'
  },
  {
    stage: 'STAGE 6 • SA\'I (SAFA & MARWAH)',
    ref: '7 Laps between the hills of Safa and Marwah',
    arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ ۖ أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ',
    translit: 'Innaṣ-Ṣafā wal-Marwata min sha‘ā’irillāh. Abda’u bimā bada’allāhu bih.',
    transl: 'Indeed, as-Safa and al-Marwah are among the symbols of Allah. I begin with that which Allah began with.',
    instructions: 'Ascend Safa, face the Kaaba, raise your hands and glorify Allah. Walk towards Marwah. Men run moderately between the two green fluorescent markers. Complete 7 laps (Safa to Marwah is 1, Marwah to Safa is 2, ending on Marwah at lap 7).'
  },
  {
    stage: 'STAGE 7 • HALQ / TAQSIR (COMPLETION)',
    ref: 'Culmination of Umrah and exiting Ihram',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ',
    translit: 'Alḥamdu lillāhil-ladhī bini‘matihī tatimmuṣ-ṣāliḥāt.',
    transl: 'All praise is due to Allah by Whose grace good deeds are completed.',
    instructions: 'Men shave (Halq) or evenly trim (Taqsir) all hair from the entire head. Women cut a fingertip length from the end of their braid or ponytail. All Ihram prohibitions are now lifted, and your Umrah is complete. Mabrooq!'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let ambientDroneGain = null;
  let currentStepIdx = 0;
  let currentLap = 1;
  let isPlaying = false;

  const stageTitle = document.getElementById('stageTitle');
  const stageRef = document.getElementById('stageRef');
  const arabicText = document.getElementById('arabicText');
  const translitText = document.getElementById('translitText');
  const translText = document.getElementById('translText');
  const ritualInstructions = document.getElementById('ritualInstructions');
  const lapDots = document.getElementById('lapDots');
  const currentLapDisplay = document.getElementById('currentLapDisplay');
  const lapSubtext = document.getElementById('lapSubtext');
  const btnNextLap = document.getElementById('btnNextLap');
  const btnResetLaps = document.getElementById('btnResetLaps');
  const btnPlayAudio = document.getElementById('btnPlayAudio');
  const btnStopAudio = document.getElementById('btnStopAudio');
  const btnChimeLap = document.getElementById('btnChimeLap');
  const btnDownloadGuideWav = document.getElementById('btnDownloadGuideWav');
  const btnCopyDua = document.getElementById('btnCopyDua');
  const reciterMode = document.getElementById('reciterMode');
  const voiceSelect = document.getElementById('voiceSelect');
  const ambientAmbience = document.getElementById('ambientAmbience');
  const ambienceVal = document.getElementById('ambienceVal');

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

    const arabicIdx = voices.findIndex(v => v.lang.startsWith('ar'));
    if (arabicIdx !== -1) {
      voiceSelect.value = arabicIdx;
    }
  }
  populateVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Lap Circles Render (1 to 7)
  function renderLapCircles() {
    lapDots.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
      const c = document.createElement('div');
      c.className = 'lap-circle';
      c.textContent = i;
      if (i < currentLap) {
        c.classList.add('completed');
      } else if (i === currentLap) {
        c.classList.add('current');
      }
      c.addEventListener('click', () => {
        setLap(i);
      });
      lapDots.appendChild(c);
    }
    currentLapDisplay.textContent = currentLap;
    if (currentStepIdx === 5) {
      // Sa'i mode
      const isOdd = currentLap % 2 !== 0;
      lapSubtext.textContent = isOdd ? `Lap ${currentLap}: Walking Safa → Marwah` : `Lap ${currentLap}: Walking Marwah → Safa`;
    } else {
      lapSubtext.textContent = `Circuit ${currentLap} around the Kaaba`;
    }
  }

  function setLap(lapNum) {
    currentLap = Math.max(1, Math.min(7, lapNum));
    renderLapCircles();
    playGentleChime();
  }

  btnNextLap.addEventListener('click', () => {
    if (currentLap < 7) {
      currentLap++;
      setLap(currentLap);
    } else {
      alert('Alhamdulillah! You have completed all 7 circuits/laps.');
      setLap(1);
    }
  });

  btnResetLaps.addEventListener('click', () => {
    setLap(1);
  });

  // Switch Ritual Step
  function setStep(idx) {
    currentStepIdx = idx;
    const s = RITUAL_STEPS[idx];
    stageTitle.textContent = s.stage;
    stageRef.textContent = s.ref;
    arabicText.textContent = s.arabic;
    translitText.textContent = s.translit;
    translText.textContent = `"${s.transl}"`;
    ritualInstructions.textContent = s.instructions;

    document.querySelectorAll('.step-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === idx);
    });

    renderLapCircles();
  }

  document.querySelectorAll('.step-tab').forEach((tab, i) => {
    tab.addEventListener('click', () => {
      setStep(i);
      stopAudio();
    });
  });

  // Audio Context & Peaceful Ambient Drone
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
      startSanctuaryDrone();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function startSanctuaryDrone() {
    // Gentle warm harmonic bed (F major meditative drone: F2, C3, A3)
    const freqs = [87.31, 130.81, 220.00];
    const masterGain = audioCtx.createGain();
    const vol = (ambientAmbience.value / 100) * 0.15;
    masterGain.gain.setValueAtTime(vol, audioCtx.currentTime);
    ambientDroneGain = masterGain;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    masterGain.connect(filter);
    filter.connect(audioCtx.destination);

    freqs.forEach(f => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, audioCtx.currentTime);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
    });
  }

  ambientAmbience.addEventListener('input', () => {
    ambienceVal.textContent = `${ambientAmbience.value}%`;
    if (ambientDroneGain && audioCtx) {
      ambientDroneGain.gain.setValueAtTime((ambientAmbience.value / 100) * 0.15, audioCtx.currentTime);
    }
  });

  // Peaceful Bell Chime for Lap / Attention
  function playGentleChime(customCtx = null, destination = null) {
    const ctx = customCtx || getAudioContext();
    const dest = destination || ctx.destination;
    const now = ctx.currentTime + 0.05;

    // Harmonic bell notes: 528Hz (Love/Peace) + 1056Hz
    [528, 1056, 1584].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(amp, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 2.6);
    });
  }

  btnChimeLap.addEventListener('click', () => playGentleChime());

  // Recite Step Audio
  function playAudioGuide() {
    stopAudio();
    isPlaying = true;
    getAudioContext();
    playGentleChime();

    if (!('speechSynthesis' in window)) return;

    const s = RITUAL_STEPS[currentStepIdx];
    const mode = reciterMode.value;

    let textToSpeak = '';
    if (mode === 'arabic_only') {
      textToSpeak = s.arabic;
    } else if (mode === 'english_only') {
      textToSpeak = s.transl;
    } else {
      // Bilingual
      textToSpeak = `${s.arabic}. Translation: ${s.transl}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.88; // Reverent, deliberate pace
    utterance.pitch = 1.0;

    if (voiceSelect.value !== '' && voices[voiceSelect.value]) {
      utterance.voice = voices[voiceSelect.value];
    }

    utterance.onend = () => {
      isPlaying = false;
    };
    utterance.onerror = () => {
      isPlaying = false;
    };

    // Small delay for gentle chime to start
    setTimeout(() => {
      if (isPlaying) {
        window.speechSynthesis.speak(utterance);
      }
    }, 600);
  }

  function stopAudio() {
    isPlaying = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  btnPlayAudio.addEventListener('click', playAudioGuide);
  btnStopAudio.addEventListener('click', stopAudio);

  // Copy Du'a
  btnCopyDua.addEventListener('click', () => {
    const s = RITUAL_STEPS[currentStepIdx];
    const fullText = `${s.stage}\n\nArabic: ${s.arabic}\nTransliteration: ${s.translit}\nTranslation: ${s.transl}\n\nInstructions: ${s.instructions}`;
    navigator.clipboard.writeText(fullText).then(() => {
      const orig = btnCopyDua.textContent;
      btnCopyDua.textContent = '✓ Copied to Clipboard!';
      setTimeout(() => btnCopyDua.textContent = orig, 2000);
    });
  });

  // Download Spiritual Audio WAV
  btnDownloadGuideWav.addEventListener('click', async () => {
    btnDownloadGuideWav.disabled = true;
    btnDownloadGuideWav.innerHTML = '<span>Rendering Audio...</span>';

    try {
      const sampleRate = 44100;
      const duration = 4.5;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * duration, sampleRate);

      // Play sacred bell chime
      playGentleChime(offlineCtx, offlineCtx.destination);

      // Add gentle harmonic drone
      const freqs = [87.31, 130.81, 220.00];
      freqs.forEach(f => {
        const osc = offlineCtx.createOscillator();
        const g = offlineCtx.createGain();
        osc.frequency.value = f;
        g.gain.setValueAtTime(0.08, 0);
        g.gain.exponentialRampToValueAtTime(0.0001, duration);
        osc.connect(g);
        g.connect(offlineCtx.destination);
        osc.start(0);
        osc.stop(duration);
      });

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `umrah_spiritual_audio_step${currentStepIdx + 1}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Audio render error: ' + e.message);
    } finally {
      btnDownloadGuideWav.disabled = false;
      btnDownloadGuideWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Download Spiritual Audio (WAV)</span>
      `;
    }
  });

  // Init
  setStep(0);
});