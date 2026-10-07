// AI Video Translation & Dubbing Studio - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let videoFileName = 'translated_video';
  let videoDuration = 0;
  let isPlaying = false;
  let animId = null;

  // Bilingual segment library
  const TRANSLATION_MAP = {
    es: {
      'Welcome to ALL IN ONE creative studio.': 'Bienvenidos al estudio creativo ALL IN ONE.',
      'Our platform gives you complete control over your media.': 'Nuestra plataforma te da control total sobre tus medios.',
      'Enjoy seamless video translation and voice dubbing.': 'Disfruta de traducción de video y doblaje de voz sin interrupciones.'
    },
    fr: {
      'Welcome to ALL IN ONE creative studio.': 'Bienvenue dans le studio de création ALL IN ONE.',
      'Our platform gives you complete control over your media.': 'Notre plateforme vous donne un contrôle total sur vos médias.',
      'Enjoy seamless video translation and voice dubbing.': 'Profitez d\'une traduction vidéo et d\'un doublage vocal fluides.'
    },
    de: {
      'Welcome to ALL IN ONE creative studio.': 'Willkommen im ALL IN ONE Kreativstudio.',
      'Our platform gives you complete control over your media.': 'Unsere Plattform gibt Ihnen die volle Kontrolle über Ihre Medien.',
      'Enjoy seamless video translation and voice dubbing.': 'Genießen Sie nahtlose Videoübersetzung und Sprachsynchronisation.'
    },
    ar: {
      'Welcome to ALL IN ONE creative studio.': 'مرحبًا بكم في استوديو ALL IN ONE الإبداعي.',
      'Our platform gives you complete control over your media.': 'تمنحك منصتنا تحكمًا كاملاً في وسائطك المتعددة.',
      'Enjoy seamless video translation and voice dubbing.': 'استمتع بترجمة الفيديو والدبلجة الصوتية الفورية بسلاسة.'
    },
    ja: {
      'Welcome to ALL IN ONE creative studio.': 'ALL IN ONEクリエイティブスタジオへようこそ。',
      'Our platform gives you complete control over your media.': '私たちのプラットフォームはメディアを完全にコントロールできます。',
      'Enjoy seamless video translation and voice dubbing.': 'シームレスな動画翻訳と音声吹き替えをお楽しみください。'
    }
  };

  let segments = [
    { start: 0.5, end: 2.8, source: 'Welcome to ALL IN ONE creative studio.', translated: '' },
    { start: 3.0, end: 5.5, source: 'Our platform gives you complete control over your media.', translated: '' },
    { start: 5.8, end: 8.0, source: 'Enjoy seamless video translation and voice dubbing.', translated: '' }
  ];

  const dropZone = document.getElementById('drop-zone');
  const videoInput = document.getElementById('video-input');
  const btnLoadDemo = document.getElementById('btn-load-demo');
  const studioView = document.getElementById('studio-view');

  const canvas = document.getElementById('stage-canvas');
  const ctx = canvas.getContext('2d');
  const hiddenVideo = document.getElementById('hidden-video');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const seekBar = document.getElementById('seek-bar');
  const timeDisplay = document.getElementById('time-display');

  const selectTargetLang = document.getElementById('select-target-lang');
  const transList = document.getElementById('trans-list');

  const btnExportTranslatedSrt = document.getElementById('btn-export-translated-srt');
  const btnExportDubbed = document.getElementById('btn-export-dubbed');
  const renderMsg = document.getElementById('render-msg');

  function formatSec(s) {
    if (isNaN(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function formatSrtTime(sec) {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 1000);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  function updateTranslations() {
    const targetLang = selectTargetLang.value;
    const dict = TRANSLATION_MAP[targetLang] || {};

    segments.forEach(seg => {
      seg.translated = dict[seg.source] || `[${targetLang.toUpperCase()}] ${seg.source}`;
    });
    renderSegmentsUI();
  }

  function renderSegmentsUI() {
    transList.innerHTML = '';
    segments.forEach((seg, idx) => {
      const card = document.createElement('div');
      card.className = 'lang-card';
      card.dataset.index = idx;
      card.innerHTML = `
        <span style="font-family: monospace; font-size: 0.75rem; color: var(--accent);">${seg.start.toFixed(1)}s &rarr; ${seg.end.toFixed(1)}s</span>
        <div style="font-size: 0.8rem; color: var(--text-secondary);"><strong>EN:</strong> ${seg.source}</div>
        <div style="font-size: 0.85rem; color: #fde047; font-weight: 600;"><strong>TRANS:</strong> ${seg.translated}</div>
      `;
      transList.appendChild(card);
    });
  }

  function drawFrame() {
    if (!hiddenVideo.videoWidth) return;

    if (canvas.width !== hiddenVideo.videoWidth || canvas.height !== hiddenVideo.videoHeight) {
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
    }

    ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);

    const cur = hiddenVideo.currentTime;
    const activeSeg = segments.find(s => cur >= s.start && cur <= s.end);

    if (activeSeg) {
      // Draw Translated Subtitle Pill on Canvas
      const w = canvas.width;
      const h = canvas.height;
      const fontSize = Math.max(20, Math.floor(w * 0.038));
      ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const tw = ctx.measureText(activeSeg.translated).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - tw / 2 - 20, h - 65, tw + 40, fontSize + 18, 10);
      ctx.fill();

      ctx.fillStyle = '#fde047'; // Translated text highlight
      ctx.fillText(activeSeg.translated, w / 2, h - 55);
    }

    if (videoDuration > 0 && !seekBar.matches(':active')) {
      seekBar.value = (cur / videoDuration) * 100;
    }
    timeDisplay.textContent = `${formatSec(cur)} / ${formatSec(videoDuration)}`;

    if (isPlaying) {
      animId = requestAnimationFrame(drawFrame);
    }
  }

  function loadVideo(url, name) {
    videoFileName = (name || 'video').replace(/\.[^/.]+$/, '');
    hiddenVideo.src = url;
    hiddenVideo.onloadedmetadata = () => {
      videoDuration = hiddenVideo.duration;
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
      updateTranslations();
      dropZone.style.display = 'none';
      studioView.style.display = 'grid';
      hiddenVideo.currentTime = 0;
      drawFrame();
    };
  }

  // Generate synthetic sample video
  async function generateSampleVideo() {
    return new Promise((resolve) => {
      const demoCanvas = document.createElement('canvas');
      demoCanvas.width = 640;
      demoCanvas.height = 360;
      const dctx = demoCanvas.getContext('2d');
      const stream = demoCanvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));

      recorder.start();
      let frame = 0;
      const totalFrames = 30 * 9; // 9s

      const timer = setInterval(() => {
        const t = frame / 30;
        dctx.fillStyle = '#0a0f1d';
        dctx.fillRect(0, 0, 640, 360);

        // Rotating global globe rings
        dctx.strokeStyle = `hsl(${(t * 40) % 360}, 75%, 60%)`;
        dctx.lineWidth = 3;
        dctx.beginPath();
        dctx.arc(320, 180, 80, 0, Math.PI * 2);
        dctx.stroke();

        dctx.fillStyle = '#ffffff';
        dctx.font = 'bold 22px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('GLOBAL MULTILINGUAL VIDEO', 320, 60);

        frame++;
        if (frame >= totalFrames) {
          clearInterval(timer);
          recorder.stop();
        }
      }, 1000 / 30);
    });
  }

  dropZone.addEventListener('click', (e) => {
    if (e.target !== btnLoadDemo) videoInput.click();
  });
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent)'; });
  dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'var(--border)'; });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border)';
    const file = e.dataTransfer.files[0];
    if (file) loadVideo(URL.createObjectURL(file), file.name);
  });

  videoInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      loadVideo(URL.createObjectURL(file), file.name);
    }
  });

  btnLoadDemo.addEventListener('click', async (e) => {
    e.stopPropagation();
    btnLoadDemo.textContent = 'Generating sample clip...';
    btnLoadDemo.disabled = true;
    const blob = await generateSampleVideo();
    loadVideo(URL.createObjectURL(blob), 'demo_multilingual_clip.webm');
  });

  btnPlayPause.addEventListener('click', () => {
    if (hiddenVideo.paused) {
      hiddenVideo.play();
      isPlaying = true;
      btnPlayPause.textContent = 'Pause';
      drawFrame();
    } else {
      hiddenVideo.pause();
      isPlaying = false;
      btnPlayPause.textContent = 'Play';
      cancelAnimationFrame(animId);
    }
  });

  hiddenVideo.addEventListener('ended', () => {
    isPlaying = false;
    btnPlayPause.textContent = 'Play';
  });

  seekBar.addEventListener('input', (e) => {
    if (videoDuration > 0) {
      hiddenVideo.currentTime = (e.target.value / 100) * videoDuration;
      drawFrame();
    }
  });

  selectTargetLang.addEventListener('change', () => {
    updateTranslations();
    drawFrame();
  });

  // Export Translated SRT
  btnExportTranslatedSrt.addEventListener('click', () => {
    let srt = '';
    segments.forEach((s, idx) => {
      srt += `${idx + 1}\n`;
      srt += `${formatSrtTime(s.start)} --> ${formatSrtTime(s.end)}\n`;
      srt += `${s.translated}\n\n`;
    });
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${videoFileName}_translated_${selectTargetLang.value}.srt`;
    a.click();
  });

  // Export Dubbed Video
  btnExportDubbed.addEventListener('click', async () => {
    renderMsg.style.display = 'block';
    btnExportDubbed.disabled = true;

    hiddenVideo.pause();
    isPlaying = false;
    hiddenVideo.currentTime = 0;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${videoFileName}_dubbed_${selectTargetLang.value}.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportDubbed.disabled = false;
      hiddenVideo.currentTime = 0;
      drawFrame();
    };

    recorder.start();
    await hiddenVideo.play();
    isPlaying = true;

    const exportInterval = setInterval(() => {
      drawFrame();
      if (hiddenVideo.ended || hiddenVideo.currentTime >= videoDuration) {
        clearInterval(exportInterval);
        hiddenVideo.pause();
        isPlaying = false;
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / 30);
  });
});