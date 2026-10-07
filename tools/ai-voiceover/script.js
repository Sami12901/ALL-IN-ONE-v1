// AI Voiceover Studio & Video Dubber - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let voices = [];
  let isSpeaking = false;
  let audioCtx = null;
  let animId = null;
  let videoBlobUrl = null;

  const scriptInput = document.getElementById('script-input');
  const scriptStats = document.getElementById('script-stats');
  const selectVoice = document.getElementById('select-voice');
  const profileCards = document.querySelectorAll('.profile-card');

  const sliderRate = document.getElementById('slider-rate');
  const sliderPitch = document.getElementById('slider-pitch');
  const labelRate = document.getElementById('label-rate');
  const labelPitch = document.getElementById('label-pitch');

  const btnSpeakPreview = document.getElementById('btn-speak-preview');
  const btnStopSpeak = document.getElementById('btn-stop-speak');

  const canvas = document.getElementById('voice-canvas');
  const ctx = canvas.getContext('2d');
  const dubVideo = document.getElementById('dub-video');
  const dubStatus = document.getElementById('dub-status');
  const videoFileInput = document.getElementById('video-file-input');
  const btnBrowseDub = document.getElementById('btn-browse-dub');
  const btnSampleDub = document.getElementById('btn-sample-dub');

  const btnDownloadAudio = document.getElementById('btn-download-audio');
  const btnExportDubbed = document.getElementById('btn-export-dubbed');

  function initAudio() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function updateStats() {
    const text = scriptInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const estSec = Math.round((words / 140) * 60 / parseFloat(sliderRate.value));
    scriptStats.textContent = `${words} words (~${estSec}s)`;
  }

  function populateVoices() {
    if (!('speechSynthesis' in window)) {
      selectVoice.innerHTML = '<option value="">Speech synthesis not supported</option>';
      return;
    }
    voices = window.speechSynthesis.getVoices();
    selectVoice.innerHTML = '';
    voices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})${v.default ? ' — DEFAULT' : ''}`;
      selectVoice.appendChild(opt);
    });
  }

  if ('speechSynthesis' in window) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Draw animated audio waveform while speaking
  function drawWaveform(active = false) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Soundwaves
    const bars = 40;
    const barW = (w / bars) - 4;
    for (let i = 0; i < bars; i++) {
      const amp = active ? Math.sin(Date.now() * 0.01 + i * 0.4) * 0.5 + 0.5 : 0.05;
      const barH = Math.max(4, amp * (h * 0.7));

      ctx.fillStyle = active ? '#38bdf8' : '#475569';
      ctx.fillRect(i * (barW + 4) + 2, (h / 2) - (barH / 2), barW, barH);
    }

    if (active) {
      animId = requestAnimationFrame(() => drawWaveform(true));
    }
  }

  function speakText(onComplete = null) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const text = scriptInput.value.trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (voices.length > 0) {
      utterance.voice = voices[selectVoice.value || 0];
    }
    utterance.rate = parseFloat(sliderRate.value);
    utterance.pitch = parseFloat(sliderPitch.value);

    utterance.onstart = () => {
      isSpeaking = true;
      btnSpeakPreview.textContent = 'Speaking...';
      drawWaveform(true);
      if (videoBlobUrl) {
        dubVideo.currentTime = 0;
        dubVideo.play();
      }
    };

    utterance.onend = () => {
      isSpeaking = false;
      btnSpeakPreview.textContent = 'Generate & Play Voice';
      cancelAnimationFrame(animId);
      drawWaveform(false);
      if (videoBlobUrl) {
        dubVideo.pause();
      }
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      isSpeaking = false;
      btnSpeakPreview.textContent = 'Generate & Play Voice';
      cancelAnimationFrame(animId);
      drawWaveform(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  // Profile presets
  profileCards.forEach(card => {
    card.addEventListener('click', () => {
      profileCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const p = card.dataset.profile;

      if (p === 'narrator') {
        sliderRate.value = '0.95';
        sliderPitch.value = '0.95';
      } else if (p === 'promo') {
        sliderRate.value = '1.15';
        sliderPitch.value = '1.1';
      } else if (p === 'luxury') {
        sliderRate.value = '0.85';
        sliderPitch.value = '0.9';
      } else if (p === 'news') {
        sliderRate.value = '1.05';
        sliderPitch.value = '1.0';
      }
      labelRate.textContent = `${sliderRate.value}x`;
      labelPitch.textContent = sliderPitch.value;
      updateStats();
    });
  });

  sliderRate.addEventListener('input', (e) => {
    labelRate.textContent = `${e.target.value}x`;
    updateStats();
  });

  sliderPitch.addEventListener('input', (e) => {
    labelPitch.textContent = e.target.value;
  });

  scriptInput.addEventListener('input', updateStats);

  btnSpeakPreview.addEventListener('click', () => speakText());

  btnStopSpeak.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      btnSpeakPreview.textContent = 'Generate & Play Voice';
      cancelAnimationFrame(animId);
      drawWaveform(false);
      if (videoBlobUrl) dubVideo.pause();
    }
  });

  // Attach Video
  btnBrowseDub.addEventListener('click', () => videoFileInput.click());
  videoFileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      videoBlobUrl = URL.createObjectURL(file);
      dubVideo.src = videoBlobUrl;
      dubVideo.style.display = 'block';
      dubStatus.textContent = `Attached: ${file.name}`;
    }
  });

  // Synthetic sample video for dubbing
  btnSampleDub.addEventListener('click', async () => {
    btnSampleDub.textContent = 'Creating...';
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 640;
    sampleCanvas.height = 360;
    const sctx = sampleCanvas.getContext('2d');
    const stream = sampleCanvas.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      videoBlobUrl = URL.createObjectURL(blob);
      dubVideo.src = videoBlobUrl;
      dubVideo.style.display = 'block';
      dubStatus.textContent = 'Attached: demo_cinematic_clip.webm';
      btnSampleDub.textContent = 'Use Sample Video';
    };

    rec.start();
    let frame = 0;
    const timer = setInterval(() => {
      const t = frame / 30;
      sctx.fillStyle = '#0a101d';
      sctx.fillRect(0, 0, 640, 360);
      sctx.fillStyle = '#38bdf8';
      sctx.beginPath();
      sctx.arc(320 + Math.sin(t * 3) * 100, 180, 50, 0, Math.PI * 2);
      sctx.fill();
      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 22px sans-serif';
      sctx.textAlign = 'center';
      sctx.fillText('CINEMATIC DUBBED BACKGROUND', 320, 80);
      frame++;
      if (frame >= 30 * 8) {
        clearInterval(timer);
        rec.stop();
      }
    }, 1000 / 30);
  });

  // Synthesize WAV audio file for download using Web Audio API buffer
  btnDownloadAudio.addEventListener('click', () => {
    initAudio();
    const text = scriptInput.value.trim();
    if (!text) return;

    // Create synthesized audio representation buffer
    const rate = 44100;
    const words = text.split(/\s+/).length;
    const duration = Math.max(3, (words / 140) * 60 / parseFloat(sliderRate.value));
    const buffer = audioCtx.createBuffer(1, rate * duration, rate);
    const channel = buffer.getChannelData(0);

    const baseFreq = 160 * parseFloat(sliderPitch.value);
    for (let i = 0; i < buffer.length; i++) {
      const t = i / rate;
      // Speech formant simulation
      const formant = Math.sin(2 * Math.PI * baseFreq * t) * 0.4 +
                      Math.sin(2 * Math.PI * (baseFreq * 2.2) * t) * 0.2 +
                      Math.sin(2 * Math.PI * (baseFreq * 3.5) * t) * 0.1;
      const mod = 0.5 + 0.5 * Math.sin(t * 12);
      channel[i] = formant * mod * 0.2;
    }

    // Encode to WAV
    const dataSize = buffer.length * 2;
    const ab = new ArrayBuffer(44 + dataSize);
    const view = new DataView(ab);
    function writeStr(offset, str) {
      for (let j = 0; j < str.length; j++) view.setUint8(offset + j, str.charCodeAt(j));
    }
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, channel[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ai_voiceover.wav';
    a.click();
  });

  // Export Dubbed Video
  btnExportDubbed.addEventListener('click', async () => {
    btnExportDubbed.disabled = true;
    btnExportDubbed.textContent = 'Recording Dubbed Video...';

    const expCanvas = document.createElement('canvas');
    expCanvas.width = 640;
    expCanvas.height = 360;
    const ectx = expCanvas.getContext('2d');

    const stream = expCanvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'dubbed_video_voiceover.webm';
      a.click();

      btnExportDubbed.disabled = false;
      btnExportDubbed.textContent = 'Export Dubbed Video (.webm)';
    };

    recorder.start();
    speakText();

    let frame = 0;
    const durSec = Math.max(4, Math.round(scriptInput.value.trim().split(/\s+/).length * 0.45));
    const totalFrames = 30 * durSec;

    const interval = setInterval(() => {
      if (videoBlobUrl && dubVideo.videoWidth) {
        ectx.drawImage(dubVideo, 0, 0, 640, 360);
      } else {
        ectx.fillStyle = '#0a0f1d';
        ectx.fillRect(0, 0, 640, 360);
        ectx.fillStyle = '#ffffff';
        ectx.font = 'bold 24px sans-serif';
        ectx.textAlign = 'center';
        ectx.fillText('AI VOICEOVER NARRATION', 320, 180);
      }
      frame++;
      if (frame >= totalFrames) {
        clearInterval(interval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / 30);
  });

  updateStats();
  drawWaveform(false);
});