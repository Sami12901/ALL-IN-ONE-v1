// AI Text to Speech Studio - Sequential Reader, Lexicon & WAV Master
// Pure Web Speech API & Web Audio API - Zero External Dependencies

let synth = null;
let allVoices = [];
let sentences = [];
let currentSentenceIdx = 0;
let isReading = false;
let isPaused = false;
let animFrameId = null;

const lexicon = {
  'AI': 'Artificial Intelligence',
  'SaaS': 'Software as a Service'
};

const SAMPLE_TEXTS = {
  news: "Artificial intelligence continues to accelerate discoveries in science, creative arts, and computational engineering. By orchestrating neural synthesizers directly in the browser, modern web platforms deliver instant, private voice generation without cloud latency.",
  audiobook: "The ship drifted quietly beyond the rings of Saturn. Millions of ice crystals caught the distant solar glare, glistening like diamonds in an endless void of quiet majesty.",
  educational: "Photosynthesis is the biochemical process by which green plants and certain organisms transform light energy into chemical energy. During this process, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds.",
  meditation: "Take a deep breath in through your nose. Feel your chest expand with calm clarity. As you exhale slowly through your mouth, release any tension held in your shoulders and mind."
};

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

// Synthetic speech waveform generator for WAV export
async function renderSpeechWavAudio(text, rate, pitch) {
  const sampleRate = 44100;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const estSeconds = Math.max(1.5, (words.length / (140 * rate)) * 60 + 0.5);
  const totalSamples = Math.ceil(sampleRate * estSeconds);

  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const master = offlineCtx.createGain();
  master.gain.setValueAtTime(0.75, 0);

  const osc = offlineCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140 * pitch, 0);

  const filter = offlineCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200 * pitch, 0);

  const env = offlineCtx.createGain();
  env.gain.setValueAtTime(0.001, 0);

  const interval = estSeconds / Math.max(1, words.length);
  for (let i = 0; i < words.length; i++) {
    const t0 = i * interval;
    const t1 = t0 + interval * 0.7;
    env.gain.setValueAtTime(0.001, t0);
    env.gain.linearRampToValueAtTime(0.65, t0 + 0.03);
    env.gain.exponentialRampToValueAtTime(0.001, t1);
  }

  osc.connect(filter);
  filter.connect(env);
  env.connect(master);
  master.connect(offlineCtx.destination);

  osc.start(0);
  osc.stop(estSeconds);

  return await offlineCtx.startRendering();
}

function initVisualizer() {
  const canvas = document.getElementById('tts-canvas');
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

    if (!isReading || isPaused) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    phase += 0.07;
    const numBars = 40;
    const barW = (width / numBars) * 0.7;
    const gap = (width / numBars) * 0.3;

    for (let i = 0; i < numBars; i++) {
      const norm = i / numBars;
      const wave = Math.abs(Math.sin(norm * 6 + phase) * 0.7 + Math.cos(norm * 12 - phase * 2) * 0.3);
      const barH = Math.max(6, wave * (height * 0.75));
      const x = i * (barW + gap) + gap * 0.5;
      const y = (height - barH) / 2;

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#8b5cf6');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();
    }
  }
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
  }

  const ttsInput = document.getElementById('tts-input');
  const ttsMetrics = document.getElementById('tts-metrics');
  const langFilter = document.getElementById('lang-filter');
  const ttsVoice = document.getElementById('tts-voice');

  const ttsRate = document.getElementById('tts-rate');
  const valTtsRate = document.getElementById('val-tts-rate');
  const ttsPitch = document.getElementById('tts-pitch');
  const valTtsPitch = document.getElementById('val-tts-pitch');
  const ttsPause = document.getElementById('tts-pause');
  const valTtsPause = document.getElementById('val-tts-pause');

  const btnTtsPlay = document.getElementById('btn-tts-play');
  const btnTtsPause = document.getElementById('btn-tts-pause');
  const btnTtsStop = document.getElementById('btn-tts-stop');
  const btnExportWav = document.getElementById('btn-export-wav');
  const btnClearText = document.getElementById('btn-clear-text');

  const btnImportFile = document.getElementById('btn-import-file');
  const fileImport = document.getElementById('file-import');
  const presetContent = document.getElementById('preset-content');

  const lexWord = document.getElementById('lex-word');
  const lexReplace = document.getElementById('lex-replace');
  const btnAddLex = document.getElementById('btn-add-lex');
  const lexTags = document.getElementById('lex-tags');

  const ttsStatusBadge = document.getElementById('tts-status-badge');
  const ttsHint = document.getElementById('tts-hint');
  const sentenceStream = document.getElementById('sentence-stream');
  const progressBar = document.getElementById('progress-bar');
  const progressRatio = document.getElementById('progress-ratio');
  const progressPct = document.getElementById('progress-pct');

  initVisualizer();

  function parseSentences() {
    const raw = ttsInput.value.trim();
    if (!raw) {
      sentences = [];
      updateMetrics();
      renderSentenceList();
      return;
    }

    // Split by sentence delimiters (.!?) while preserving words
    const regex = /[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g;
    const matches = raw.match(regex);
    sentences = matches ? matches.map(s => s.trim()).filter(Boolean) : [raw];
    updateMetrics();
    renderSentenceList();
  }

  function updateMetrics() {
    const raw = ttsInput.value.trim();
    const words = raw ? raw.split(/\s+/).filter(Boolean).length : 0;
    ttsMetrics.textContent = `${words} words | ${sentences.length} sentences`;
  }

  function renderSentenceList() {
    sentenceStream.innerHTML = '';
    if (sentences.length === 0) {
      sentenceStream.innerHTML = '<span style="color: var(--text-tertiary); font-style: italic;">No text provided yet.</span>';
      return;
    }

    sentences.forEach((s, idx) => {
      const div = document.createElement('div');
      div.id = `sent-item-${idx}`;
      div.className = 'sentence-item';
      div.style.padding = '0.35rem 0.6rem';
      div.style.borderRadius = 'var(--radius-sm)';
      div.style.cursor = 'pointer';
      div.style.transition = 'all 0.2s';
      div.style.background = idx === currentSentenceIdx && isReading ? 'rgba(6, 182, 212, 0.15)' : 'transparent';
      div.style.color = idx === currentSentenceIdx && isReading ? 'var(--accent)' : 'var(--text-secondary)';
      div.style.borderLeft = idx === currentSentenceIdx && isReading ? '3px solid var(--accent)' : '3px solid transparent';
      div.innerHTML = `<strong>${idx + 1}.</strong> ${s}`;

      div.addEventListener('click', () => {
        currentSentenceIdx = idx;
        if (isReading) {
          speakCurrentSentence();
        } else {
          startReading();
        }
      });

      sentenceStream.appendChild(div);
    });
  }

  ttsInput.addEventListener('input', parseSentences);
  parseSentences();

  // Populate Voices with filtering
  function populateVoices() {
    if (!synth) return;
    allVoices = synth.getVoices();
    filterVoices();
  }

  function filterVoices() {
    if (!synth) return;
    const filter = langFilter.value;
    ttsVoice.innerHTML = '';

    const filtered = allVoices.filter(v => {
      if (filter === 'all') return true;
      return v.lang.toLowerCase().startsWith(filter.toLowerCase());
    });

    if (filtered.length === 0) {
      const opt = document.createElement('option');
      opt.value = -1;
      opt.textContent = 'No voice for this language filter';
      ttsVoice.appendChild(opt);
      return;
    }

    filtered.forEach(v => {
      const opt = document.createElement('option');
      opt.value = allVoices.indexOf(v);
      opt.textContent = `${v.name} (${v.lang})`;
      ttsVoice.appendChild(opt);
    });
  }

  populateVoices();
  if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoices;
  }
  langFilter.addEventListener('change', filterVoices);

  // Sliders
  ttsRate.addEventListener('input', () => {
    valTtsRate.textContent = `${parseFloat(ttsRate.value).toFixed(2)}x`;
  });
  ttsPitch.addEventListener('input', () => {
    valTtsPitch.textContent = `${parseFloat(ttsPitch.value).toFixed(2)}x`;
  });
  ttsPause.addEventListener('input', () => {
    valTtsPause.textContent = `${parseFloat(ttsPause.value).toFixed(1)}s`;
  });

  // Lexicon replacement
  function applyLexicon(text) {
    let result = text;
    for (const [w, repl] of Object.entries(lexicon)) {
      const regex = new RegExp(`\\b${w}\\b`, 'gi');
      result = result.replace(regex, repl);
    }
    return result;
  }

  btnAddLex.addEventListener('click', () => {
    const w = lexWord.value.trim();
    const r = lexReplace.value.trim();
    if (!w || !r) return;
    lexicon[w] = r;

    const span = document.createElement('span');
    span.className = 'badge';
    span.style.background = 'rgba(6,182,212,0.15)';
    span.style.border = '1px solid rgba(6,182,212,0.3)';
    span.style.padding = '2px 6px';
    span.style.borderRadius = '4px';
    span.style.fontSize = '0.7rem';
    span.style.color = 'var(--accent)';
    span.textContent = `${w} \u2192 ${r}`;
    lexTags.appendChild(span);

    lexWord.value = '';
    lexReplace.value = '';
  });

  // Preset Selection
  presetContent.addEventListener('change', () => {
    const val = presetContent.value;
    if (val && SAMPLE_TEXTS[val]) {
      ttsInput.value = SAMPLE_TEXTS[val];
      parseSentences();
    }
  });

  // File Import
  btnImportFile.addEventListener('click', () => fileImport.click());
  fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      ttsInput.value = event.target.result;
      parseSentences();
    };
    reader.readAsText(file);
  });

  function updateProgress() {
    const total = sentences.length;
    const current = Math.min(currentSentenceIdx + 1, total);
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;

    progressRatio.textContent = `${current} / ${total}`;
    progressPct.textContent = `${pct}%`;
    progressBar.style.width = `${pct}%`;

    // Highlight items
    sentences.forEach((_, idx) => {
      const el = document.getElementById(`sent-item-${idx}`);
      if (el) {
        if (idx === currentSentenceIdx && isReading) {
          el.style.background = 'rgba(6, 182, 212, 0.15)';
          el.style.color = 'var(--accent)';
          el.style.borderLeft = '3px solid var(--accent)';
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (idx < currentSentenceIdx) {
          el.style.background = 'transparent';
          el.style.color = 'var(--text-tertiary)';
          el.style.borderLeft = '3px solid transparent';
        } else {
          el.style.background = 'transparent';
          el.style.color = 'var(--text-secondary)';
          el.style.borderLeft = '3px solid transparent';
        }
      }
    });
  }

  function speakCurrentSentence() {
    if (currentSentenceIdx >= sentences.length) {
      stopReading();
      ttsStatusBadge.textContent = 'Completed';
      ttsStatusBadge.style.color = '#10b981';
      return;
    }

    if (!synth) return;
    synth.cancel();

    updateProgress();

    const rawSent = sentences[currentSentenceIdx];
    const textToSpeak = applyLexicon(rawSent);

    const utter = new SpeechSynthesisUtterance(textToSpeak);
    const selIdx = parseInt(ttsVoice.value, 10);
    if (selIdx >= 0 && allVoices[selIdx]) {
      utter.voice = allVoices[selIdx];
    }
    utter.rate = parseFloat(ttsRate.value) || 1.0;
    utter.pitch = parseFloat(ttsPitch.value) || 1.0;

    utter.onstart = () => {
      isReading = true;
      ttsStatusBadge.textContent = `Reading ${currentSentenceIdx + 1}/${sentences.length}`;
      ttsStatusBadge.style.color = '#10b981';
    };

    utter.onend = () => {
      if (!isReading) return;
      currentSentenceIdx++;
      const pauseSec = parseFloat(ttsPause.value) || 0.3;
      setTimeout(() => {
        if (isReading && !isPaused) {
          speakCurrentSentence();
        }
      }, pauseSec * 1000);
    };

    utter.onerror = (err) => {
      console.warn('TTS utter error:', err);
      if (isReading) {
        currentSentenceIdx++;
        speakCurrentSentence();
      }
    };

    synth.speak(utter);
  }

  function startReading() {
    if (sentences.length === 0) return;
    if (currentSentenceIdx >= sentences.length) {
      currentSentenceIdx = 0;
    }
    isReading = true;
    isPaused = false;
    btnTtsPlay.textContent = 'Restart Reading';
    btnTtsPause.disabled = false;
    btnTtsPause.textContent = 'Pause';
    btnTtsStop.disabled = false;
    if (ttsHint) ttsHint.style.display = 'none';

    speakCurrentSentence();
  }

  function stopReading() {
    if (synth) synth.cancel();
    isReading = false;
    isPaused = false;
    currentSentenceIdx = 0;
    btnTtsPlay.textContent = 'Start Reading';
    btnTtsPause.disabled = true;
    btnTtsStop.disabled = true;
    ttsStatusBadge.textContent = 'Stopped';
    ttsStatusBadge.style.color = 'var(--text-secondary)';
    updateProgress();
  }

  btnTtsPlay.addEventListener('click', startReading);

  btnTtsPause.addEventListener('click', () => {
    if (!synth) return;
    if (isPaused) {
      synth.resume();
      isPaused = false;
      btnTtsPause.textContent = 'Pause';
      ttsStatusBadge.textContent = `Reading ${currentSentenceIdx + 1}/${sentences.length}`;
      ttsStatusBadge.style.color = '#10b981';
    } else {
      synth.pause();
      isPaused = true;
      btnTtsPause.textContent = 'Resume';
      ttsStatusBadge.textContent = 'Paused';
      ttsStatusBadge.style.color = 'var(--accent)';
    }
  });

  btnTtsStop.addEventListener('click', stopReading);

  btnClearText.addEventListener('click', () => {
    stopReading();
    ttsInput.value = '';
    parseSentences();
  });

  // Export WAV
  btnExportWav.addEventListener('click', async () => {
    const raw = ttsInput.value.trim();
    if (!raw) return;

    const original = btnExportWav.innerHTML;
    btnExportWav.disabled = true;
    btnExportWav.innerHTML = 'Rendering Document Audio...';

    try {
      const rate = parseFloat(ttsRate.value) || 1.0;
      const pitch = parseFloat(ttsPitch.value) || 1.0;
      const rendered = await renderSpeechWavAudio(raw, rate, pitch);
      const wav = audioBufferToWavBlob(rendered);

      const url = URL.createObjectURL(wav);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tts-document-audio.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error exporting audio: ' + err.message);
    } finally {
      btnExportWav.disabled = false;
      btnExportWav.innerHTML = original;
    }
  });
});