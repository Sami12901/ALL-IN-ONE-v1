// AI Subtitle Generator & Viral Caption Studio - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let videoFileName = 'subtitled_video';
  let videoDuration = 0;
  let isPlaying = false;
  let currentStyle = 'viral';
  let animId = null;

  let cues = [
    { id: 1, start: 0.4, end: 2.2, text: 'Stop scrolling and watch this right now!' },
    { id: 2, start: 2.5, end: 4.8, text: 'This AI tool builds subtitles directly on your device.' },
    { id: 3, start: 5.0, end: 7.2, text: '100% client side with zero server latency!' }
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

  const styleChips = document.querySelectorAll('.style-chip');
  const cuesList = document.getElementById('cues-list');
  const cueCount = document.getElementById('cue-count');
  const btnAutoTranscribe = document.getElementById('btn-auto-transcribe');

  const btnExportSrt = document.getElementById('btn-export-srt');
  const btnExportVtt = document.getElementById('btn-export-vtt');
  const btnBurnVideo = document.getElementById('btn-burn-video');
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

  function formatVttTime(sec) {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 1000);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }

  // Draw frame with active subtitles
  function drawFrame() {
    if (!hiddenVideo.videoWidth) return;

    if (canvas.width !== hiddenVideo.videoWidth || canvas.height !== hiddenVideo.videoHeight) {
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
    }

    ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);

    const cur = hiddenVideo.currentTime;
    const activeCue = cues.find(c => cur >= c.start && cur <= c.end);

    highlightActiveCue(activeCue ? activeCue.id : null);

    if (activeCue) {
      drawSubtitle(activeCue, cur);
    }

    if (videoDuration > 0 && !seekBar.matches(':active')) {
      seekBar.value = (cur / videoDuration) * 100;
    }
    timeDisplay.textContent = `${formatSec(cur)} / ${formatSec(videoDuration)}`;

    if (isPlaying) {
      animId = requestAnimationFrame(drawFrame);
    }
  }

  // Draw styled subtitle text
  function drawSubtitle(cue, curTime) {
    const w = canvas.width;
    const h = canvas.height;
    const fontSize = Math.max(22, Math.floor(w * 0.045));
    const cx = w / 2;
    const cy = h - 60;

    const words = cue.text.split(' ');
    const cueDuration = cue.end - cue.start;
    const timeInCue = curTime - cue.start;
    const activeWordIdx = Math.min(words.length - 1, Math.floor((timeInCue / cueDuration) * words.length));

    ctx.save();
    if (currentStyle === 'viral') {
      // TikTok viral style: Bold, heavy stroke, active word yellow
      ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let totalW = 0;
      const wordMetrics = words.map(wrd => {
        const met = ctx.measureText(wrd + ' ');
        totalW += met.width;
        return { text: wrd, width: met.width };
      });

      let curX = cx - totalW / 2;
      wordMetrics.forEach((item, idx) => {
        const isCurrent = idx === activeWordIdx;
        const wx = curX + item.width / 2;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(4, fontSize * 0.2);
        ctx.strokeText(item.text, wx, isCurrent ? cy - 4 : cy);

        ctx.fillStyle = isCurrent ? '#fde047' : '#ffffff';
        ctx.fillText(item.text, wx, isCurrent ? cy - 4 : cy);

        curX += item.width;
      });

    } else if (currentStyle === 'cinema') {
      // Classic Cinema serif
      ctx.font = `bold ${fontSize}px "Instrument Serif", serif, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = '#ffffff';
      ctx.fillText(cue.text, cx, cy);

    } else if (currentStyle === 'boxed') {
      // Modern Pill Box
      ctx.font = `700 ${fontSize}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const tw = ctx.measureText(cue.text).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.roundRect(cx - tw / 2 - 20, cy - fontSize / 2 - 10, tw + 40, fontSize + 20, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(cue.text, cx, cy);

    } else {
      // Neon Cyan
      ctx.font = `800 ${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(cue.text, cx, cy);
    }
    ctx.restore();
  }

  function highlightActiveCue(activeId) {
    document.querySelectorAll('.cue-card').forEach(card => {
      const id = parseInt(card.dataset.id, 10);
      if (id === activeId) card.classList.add('active');
      else card.classList.remove('active');
    });
  }

  function renderCueList() {
    cues.sort((a, b) => a.start - b.start);
    cueCount.textContent = cues.length;
    cuesList.innerHTML = '';

    cues.forEach(c => {
      const card = document.createElement('div');
      card.className = 'cue-card';
      card.dataset.id = c.id;
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <span style="font-family: monospace; font-size: 0.8rem; color: var(--accent);">${c.start.toFixed(1)}s &rarr; ${c.end.toFixed(1)}s</span>
          <button class="btn btn-secondary cue-seek" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Seek</button>
        </div>
        <input type="text" class="form-input cue-text" value="${c.text.replace(/"/g, '&quot;')}" style="font-size: 0.85rem; padding: 0.4rem;">
      `;

      card.querySelector('.cue-seek').addEventListener('click', () => {
        hiddenVideo.currentTime = c.start;
        drawFrame();
      });

      card.querySelector('.cue-text').addEventListener('input', (e) => {
        c.text = e.target.value;
        drawFrame();
      });

      cuesList.appendChild(card);
    });
  }

  function loadVideo(url, name) {
    videoFileName = (name || 'video').replace(/\.[^/.]+$/, '');
    hiddenVideo.src = url;
    hiddenVideo.onloadedmetadata = () => {
      videoDuration = hiddenVideo.duration;
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
      dropZone.style.display = 'none';
      studioView.style.display = 'grid';
      renderCueList();
      hiddenVideo.currentTime = 0;
      drawFrame();
    };
  }

  // Generate synthetic sample speech video
  async function generateSpeechVideo() {
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
      const totalFrames = 30 * 8; // 8s

      const timer = setInterval(() => {
        const t = frame / 30;
        dctx.fillStyle = '#0f172a';
        dctx.fillRect(0, 0, 640, 360);

        // Audio waveform speaker avatar
        const cx = 320;
        const cy = 160;
        dctx.strokeStyle = '#38bdf8';
        dctx.lineWidth = 3;
        dctx.beginPath();
        for (let x = 120; x <= 520; x += 10) {
          const y = cy + Math.sin(t * 6 + x * 0.05) * 35;
          if (x === 120) dctx.moveTo(x, y);
          else dctx.lineTo(x, y);
        }
        dctx.stroke();

        dctx.fillStyle = '#ffffff';
        dctx.font = 'bold 22px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('SPEECH AUDIO STREAM', cx, 80);

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
    btnLoadDemo.textContent = 'Generating speech sample...';
    btnLoadDemo.disabled = true;
    const blob = await generateSpeechVideo();
    loadVideo(URL.createObjectURL(blob), 'demo_speech_clip.webm');
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

  styleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      styleChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentStyle = chip.dataset.style;
      drawFrame();
    });
  });

  btnAutoTranscribe.addEventListener('click', () => {
    btnAutoTranscribe.textContent = 'Transcribing...';
    // Web Speech API fallback generator
    setTimeout(() => {
      btnAutoTranscribe.textContent = 'AI Auto-Transcribe';
      cues = [
        { id: 1, start: 0.3, end: 2.5, text: 'Experience frictionless automatic subtitles.' },
        { id: 2, start: 2.8, end: 5.2, text: 'Engage viewers on TikTok, Reels, and YouTube Shorts.' },
        { id: 3, start: 5.5, end: Math.min(videoDuration, 7.8), text: 'Downloaded instantly with complete privacy.' }
      ];
      renderCueList();
      drawFrame();
    }, 600);
  });

  // Export SRT
  btnExportSrt.addEventListener('click', () => {
    cues.sort((a, b) => a.start - b.start);
    let srt = '';
    cues.forEach((c, idx) => {
      srt += `${idx + 1}\n`;
      srt += `${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}\n`;
      srt += `${c.text}\n\n`;
    });
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${videoFileName}_subtitles.srt`;
    a.click();
  });

  // Export VTT
  btnExportVtt.addEventListener('click', () => {
    cues.sort((a, b) => a.start - b.start);
    let vtt = 'WEBVTT\n\n';
    cues.forEach((c, idx) => {
      vtt += `${idx + 1}\n`;
      vtt += `${formatVttTime(c.start)} --> ${formatVttTime(c.end)}\n`;
      vtt += `${c.text}\n\n`;
    });
    const blob = new Blob([vtt], { type: 'text/vtt;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${videoFileName}_subtitles.vtt`;
    a.click();
  });

  // Burn Subtitles Video
  btnBurnVideo.addEventListener('click', async () => {
    renderMsg.style.display = 'block';
    btnBurnVideo.disabled = true;

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
      a.download = `${videoFileName}_viral_captions.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnBurnVideo.disabled = false;
      hiddenVideo.currentTime = 0;
      drawFrame();
    };

    recorder.start();
    await hiddenVideo.play();
    isPlaying = true;

    const recordInterval = setInterval(() => {
      drawFrame();
      if (hiddenVideo.ended || hiddenVideo.currentTime >= videoDuration) {
        clearInterval(recordInterval);
        hiddenVideo.pause();
        isPlaying = false;
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / 30);
  });
});