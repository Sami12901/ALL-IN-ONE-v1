// AI Podcast Generator & Episode Studio - Engine

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

const PODCAST_TOPICS = {
  ai_agents: {
    title: "TECH FRONTIERS #42: THE AGE OF AUTONOMOUS AGENTS",
    script: `Host: Welcome back to Tech Frontiers. Today we're exploring autonomous AI systems. Elena, is this the year agentic software finally transforms engineering?
Guest: Absolutely, Alex. We're seeing systems not just autocomplete lines of code, but architect entire backends, execute self-correcting unit tests, and deploy live.
Host: That shifts developers from mechanical typists to technical conductors. What are the key bottlenecks remaining?
Guest: Verification reliability and state persistence in multi-step trajectories. Once self-debugging becomes airtight, the productivity ceiling completely vanishes.`
  },
  bootstrapping: {
    title: "BOOTSTRAP FOUNDERS #88: REACHING $50K MRR WITH ZERO VC",
    script: `Host: Welcome back to Bootstrap Founders. Reaching fifty thousand dollars in monthly recurring revenue without venture capital sounds impossible, but you pulled it off.
Guest: Thanks for having me, Alex. The secret was brutal simplicity: solve a painful, narrow problem that giant enterprise platforms completely ignored.
Host: How did you acquire your first one hundred paying customers without a paid advertising budget?
Guest: Pure organic engineering in public. We shared our weekly revenue charts, bugs, and product roadmap openly on social media.`
  },
  mindfulness: {
    title: "THE DEEP WORK SHOW #15: FOCUS IN AN AGE OF NOISE",
    script: `Host: Welcome to The Deep Work Show. In a world of notifications and endless feeds, how do high performers safeguard their focus?
Guest: It starts with your morning dopamine baseline, Alex. If the first thing you touch within sixty minutes of waking is a glowing screen, your cognitive clarity is compromised.
Host: What practical routine restores that deep focus state?
Guest: The ninety-minute uninterrupted work sprint. No browser tabs, no messaging apps, just single-tasking flow.`
  },
  space: {
    title: "COSMIC HORIZON #104: WEBB TELESCOPE & THE EARLY UNIVERSE",
    script: `Host: Welcome to Cosmic Horizon. The latest deep-field infrared imagery from the James Webb space telescope has astounded astronomers worldwide.
Guest: Alex, what we're finding in those ancient cosmic epochs challenges classical models. The earliest galaxies were far more massive and structured than theory predicted.
Host: Could this mean our cosmological timeline needs fundamental revisions?
Guest: It is the most thrilling scientific puzzle in decades. We are essentially rewriting the opening chapters of our universe.`
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let isPlayingEpisode = false;
  let voices = [];
  let currentTurnIndex = 0;
  let dialogueTurns = [];

  // DOM
  const showTitleDisp = document.getElementById('showTitleDisp');
  const broadcastState = document.getElementById('broadcastState');
  const avatarHost = document.getElementById('avatarHost');
  const avatarGuest = document.getElementById('avatarGuest');
  const hostPill = document.getElementById('hostPill');
  const guestPill = document.getElementById('guestPill');
  const currentSubtitleText = document.getElementById('currentSubtitleText');
  const podcastScript = document.getElementById('podcastScript');

  const hostVoiceSelect = document.getElementById('hostVoiceSelect');
  const guestVoiceSelect = document.getElementById('guestVoiceSelect');
  const chkIntroTheme = document.getElementById('chkIntroTheme');
  const chkOutroTheme = document.getElementById('chkOutroTheme');

  const btnPlayEpisode = document.getElementById('btnPlayEpisode');
  const btnStopEpisode = document.getElementById('btnStopEpisode');
  const btnDownloadThemeWav = document.getElementById('btnDownloadThemeWav');

  // Load Voices
  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    [hostVoiceSelect, guestVoiceSelect].forEach(sel => {
      sel.innerHTML = '<option value="">Default System Voice</option>';
      voices.forEach((v, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${v.name} (${v.lang})`;
        sel.appendChild(opt);
      });
    });

    // Auto-select two different voices
    if (voices.length > 1) {
      const maleIdx = voices.findIndex(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Guy') || v.name.includes('George')));
      const femaleIdx = voices.findIndex(v => v.lang.startsWith('en') && (v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Samantha') || v.name.includes('Susan')));
      if (maleIdx !== -1) hostVoiceSelect.value = maleIdx;
      if (femaleIdx !== -1) guestVoiceSelect.value = femaleIdx;
      else if (voices.length > 2) guestVoiceSelect.value = 1;
    }
  }
  loadVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Topic presets
  document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const t = PODCAST_TOPICS[btn.dataset.topic];
      if (!t) return;
      showTitleDisp.textContent = t.title;
      podcastScript.value = t.script;
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

  // Synthesize Podcast Intro Theme
  function playPodcastTheme(ctx, dest, callback) {
    const now = ctx.currentTime + 0.05;
    const notes = [
      { f: 261.63, t: 0, d: 0.3 },   // C4
      { f: 329.63, t: 0.3, d: 0.3 }, // E4
      { f: 392.00, t: 0.6, d: 0.4 }, // G4
      { f: 523.25, t: 1.0, d: 0.8 }  // C5
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      g.gain.setValueAtTime(0.25, now + n.t);
      g.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(g);
      g.connect(dest);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.1);
    });

    if (callback) {
      setTimeout(callback, 1900);
    }
  }

  // Parse turns from text
  function parseDialogue() {
    const raw = podcastScript.value.trim().split('\n');
    const turns = [];
    raw.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.toLowerCase().startsWith('host:')) {
        turns.push({ speaker: 'host', text: trimmed.replace(/^host:\s*/i, '') });
      } else if (trimmed.toLowerCase().startsWith('guest:')) {
        turns.push({ speaker: 'guest', text: trimmed.replace(/^guest:\s*/i, '') });
      } else {
        // default alternating
        const prevSpeaker = turns.length > 0 ? turns[turns.length - 1].speaker : 'guest';
        turns.push({ speaker: prevSpeaker === 'host' ? 'guest' : 'host', text: trimmed });
      }
    });
    return turns;
  }

  // Playback Engine
  function playEpisode() {
    stopEpisode();
    const ctx = getAudioContext();
    isPlayingEpisode = true;
    dialogueTurns = parseDialogue();
    currentTurnIndex = 0;

    broadcastState.textContent = 'ON AIR • RECORDING';
    broadcastState.style.color = '#ef4444';

    if (chkIntroTheme.checked) {
      currentSubtitleText.textContent = '🎵 [PLAYING INTRO THEME JINGLE]';
      playPodcastTheme(ctx, ctx.destination, () => {
        if (isPlayingEpisode) playNextTurn();
      });
    } else {
      playNextTurn();
    }
  }

  function playNextTurn() {
    if (!isPlayingEpisode || currentTurnIndex >= dialogueTurns.length) {
      finishEpisode();
      return;
    }

    const turn = dialogueTurns[currentTurnIndex];
    const isHost = turn.speaker === 'host';

    // Highlight active speaker
    avatarHost.classList.toggle('speaking', isHost);
    hostPill.style.display = isHost ? 'inline-block' : 'none';

    avatarGuest.classList.toggle('speaking', !isHost);
    guestPill.style.display = !isHost ? 'inline-block' : 'none';

    currentSubtitleText.textContent = `"${turn.text}"`;

    if (!('speechSynthesis' in window)) {
      setTimeout(() => {
        currentTurnIndex++;
        playNextTurn();
      }, 2500);
      return;
    }

    const utter = new SpeechSynthesisUtterance(turn.text);
    if (isHost) {
      utter.rate = 1.0;
      utter.pitch = 0.95; // Articulate baritone
      if (hostVoiceSelect.value !== '' && voices[hostVoiceSelect.value]) {
        utter.voice = voices[hostVoiceSelect.value];
      }
    } else {
      utter.rate = 1.05;
      utter.pitch = 1.1; // Lively expert
      if (guestVoiceSelect.value !== '' && voices[guestVoiceSelect.value]) {
        utter.voice = voices[guestVoiceSelect.value];
      }
    }

    utter.onend = () => {
      currentTurnIndex++;
      setTimeout(playNextTurn, 400); // Natural conversational breath pause
    };

    utter.onerror = () => {
      currentTurnIndex++;
      playNextTurn();
    };

    window.speechSynthesis.speak(utter);
  }

  function finishEpisode() {
    isPlayingEpisode = false;
    avatarHost.classList.remove('speaking');
    avatarGuest.classList.remove('speaking');
    hostPill.style.display = 'none';
    guestPill.style.display = 'none';

    if (chkOutroTheme.checked && audioCtx) {
      currentSubtitleText.textContent = '🎵 [PLAYING OUTRO THEME]';
      playPodcastTheme(audioCtx, audioCtx.destination, () => {
        broadcastState.textContent = 'EPISODE CONCLUDED';
        broadcastState.style.color = '#00e676';
        currentSubtitleText.textContent = '[Episode finished. Thank you for listening!]';
      });
    } else {
      broadcastState.textContent = 'EPISODE CONCLUDED';
      broadcastState.style.color = '#00e676';
      currentSubtitleText.textContent = '[Episode finished. Thank you for listening!]';
    }
  }

  function stopEpisode() {
    isPlayingEpisode = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    avatarHost.classList.remove('speaking');
    avatarGuest.classList.remove('speaking');
    hostPill.style.display = 'none';
    guestPill.style.display = 'none';
    broadcastState.textContent = 'STANDBY';
    broadcastState.style.color = 'var(--text-muted)';
    currentSubtitleText.textContent = '[Press "Broadcast Episode" to start the conversation]';
  }

  btnPlayEpisode.addEventListener('click', playEpisode);
  btnStopEpisode.addEventListener('click', stopEpisode);

  // Download Theme WAV
  btnDownloadThemeWav.addEventListener('click', async () => {
    btnDownloadThemeWav.disabled = true;
    btnDownloadThemeWav.innerHTML = '<span>Rendering Theme...</span>';

    try {
      const sampleRate = 44100;
      const duration = 2.5;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * duration, sampleRate);

      playPodcastTheme(offlineCtx, offlineCtx.destination);

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `podcast_theme_jingle.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error rendering theme: ' + e.message);
    } finally {
      btnDownloadThemeWav.disabled = false;
      btnDownloadThemeWav.innerHTML = 'Download Intro Theme (WAV)';
    }
  });

  // Init
  podcastScript.value = PODCAST_TOPICS.ai_agents.script;
});