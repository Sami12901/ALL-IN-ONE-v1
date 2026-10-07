// Video Outro Maker - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let selectedTheme = 'youtube';
  let audioCtx = null;
  let animTimer = null;

  const canvas = document.getElementById('outro-canvas');
  const ctx = canvas.getContext('2d');

  const btnPreviewOutro = document.getElementById('btn-preview-outro');
  const previewProgress = document.getElementById('preview-progress');
  const durationCounter = document.getElementById('duration-counter');

  const themeCards = document.querySelectorAll('.theme-card');
  const outroHeading = document.getElementById('outro-heading');
  const outroCta = document.getElementById('outro-cta');
  const outroAccent = document.getElementById('outro-accent');
  const outroDuration = document.getElementById('outro-duration');
  const checkAudio = document.getElementById('check-audio');

  const btnExportOutro = document.getElementById('btn-export-outro');
  const renderMsg = document.getElementById('render-msg');

  function initAudio() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play peaceful relaxing outro chords via Web Audio API
  function playOutroMusic(destNode = null) {
    if (!checkAudio.checked) return;
    initAudio();

    const dest = destNode || audioCtx.destination;
    const now = audioCtx.currentTime;
    const dur = parseFloat(outroDuration.value);

    // Warm chord progression: Cmaj9 -> Am9
    const chord1 = [261.63, 329.63, 392.00, 493.88];
    const chord2 = [220.00, 261.63, 329.63, 440.00];

    [chord1, chord2].forEach((chord, chordIdx) => {
      const startT = now + (chordIdx * (dur / 2));
      const chordDur = dur / 2;

      chord.forEach((freq) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startT);

        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.linearRampToValueAtTime(0.08, startT + 0.5);
        gain.gain.setValueAtTime(0.08, startT + chordDur - 0.5);
        gain.gain.linearRampToValueAtTime(0.001, startT + chordDur);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(startT);
        osc.stop(startT + chordDur);
      });
    });
  }

  function renderFrame(progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const heading = (outroHeading.value || 'THANKS FOR WATCHING!').toUpperCase();
    const cta = outroCta.value || 'Subscribe for more updates';
    const accent = outroAccent.value || '#4e85bf';

    // Theme Background
    if (selectedTheme === 'luxury') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0d0a06');
      grad.addColorStop(1, '#1f190e');
      ctx.fillStyle = grad;
    } else if (selectedTheme === 'streamer') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#040714');
      grad.addColorStop(1, '#1e0826');
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#080c14');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, w, h);

    // Decorative grid/stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 40; x < w; x += 80) {
      for (let y = 40; y < h; y += 80) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Top Heading
    ctx.font = '800 52px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = accent;
    ctx.shadowBlur = 16;
    ctx.fillText(heading, w / 2, 100);

    // Call to Action Subtitle
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText(cta, w / 2, 150);

    // Video Slot 1 (Left: Recent Video)
    drawVideoCard(140, 210, 420, 240, 'PREVIOUS VIDEO', accent);

    // Video Slot 2 (Right: Recommended Video)
    drawVideoCard(720, 210, 420, 240, 'BEST FOR YOU', accent);

    // Animated Center Subscribe Circle
    const cx = w / 2;
    const cy = 520;
    const pulse = 1 + 0.1 * Math.sin(progress * Math.PI * 6);

    // Outer glowing ripple
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 64 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Circle Body
    ctx.fillStyle = '#ef4444'; // Red subscribe color or accent
    ctx.beginPath();
    ctx.arc(cx, cy, 54, 0, Math.PI * 2);
    ctx.fill();

    // Bell / Subscribe text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUBSCRIBE', cx, cy);

    // Bottom Countdown Progress Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(100, h - 40, w - 200, 8);

    ctx.fillStyle = accent;
    ctx.fillRect(100, h - 40, (w - 200) * progress, 8);
  }

  function drawVideoCard(x, y, width, height, title, accent) {
    // Card background
    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 12);
    ctx.fill();

    // Card border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Corner tag
    ctx.fillStyle = accent;
    ctx.font = '600 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 20, y + 36);

    // Center Play Triangle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    const px = x + width / 2;
    const py = y + height / 2;
    ctx.moveTo(px - 14, py - 20);
    ctx.lineTo(px + 18, py);
    ctx.lineTo(px - 14, py + 20);
    ctx.closePath();
    ctx.fill();
  }

  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPreviewOutro.textContent = 'Playing...';
    btnPreviewOutro.disabled = true;

    playOutroMusic();

    const duration = parseFloat(outroDuration.value);
    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);

      previewProgress.value = progress * 100;
      durationCounter.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPreviewOutro.textContent = 'Play Outro';
        btnPreviewOutro.disabled = false;
      }
    }, 1000 / fps);
  }

  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      themeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTheme = card.dataset.theme;
      renderFrame(0.5);
    });
  });

  [outroHeading, outroCta, outroAccent, outroDuration].forEach(el => {
    el.addEventListener('input', () => renderFrame(0.5));
  });

  btnPreviewOutro.addEventListener('click', playPreview);

  previewProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPreviewOutro.textContent = 'Play Outro';
      btnPreviewOutro.disabled = false;
    }
    const progress = e.target.value / 100;
    const duration = parseFloat(outroDuration.value);
    durationCounter.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;
    renderFrame(progress);
  });

  // Export Outro Video
  btnExportOutro.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportOutro.disabled = true;
    renderMsg.style.display = 'block';

    initAudio();
    const duration = parseFloat(outroDuration.value);
    const stream = canvas.captureStream(30);

    if (checkAudio.checked) {
      const audioDest = audioCtx.createMediaStreamDestination();
      playOutroMusic(audioDest);
      audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    }

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `youtube_outro_${duration}s.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportOutro.disabled = false;
      isRecording = false;
      renderFrame(0.5);
    };

    recorder.start();

    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    const recordInterval = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);
      previewProgress.value = progress * 100;
      durationCounter.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  renderFrame(0.5);
});