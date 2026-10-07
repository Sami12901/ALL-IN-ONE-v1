// Brand Story Video Creator - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let activeChapter = 0;
  let audioCtx = null;
  let animTimer = null;
  const chapterDuration = 3.0; // 3s per chapter = 12s total
  const totalDuration = chapterDuration * 4;

  const canvas = document.getElementById('story-canvas');
  const ctx = canvas.getContext('2d');

  const btnPlayStory = document.getElementById('btn-play-story');
  const storyProgress = document.getElementById('story-progress');
  const storyTime = document.getElementById('story-time');

  const brandNameInput = document.getElementById('brand-name');
  const chapterTabs = document.querySelectorAll('.chapter-tab');
  const chapterHeadline = document.getElementById('chapter-headline');
  const chapterBody = document.getElementById('chapter-body');
  const chapterQuote = document.getElementById('chapter-quote');

  const btnExportStory = document.getElementById('btn-export-story');
  const renderMsg = document.getElementById('render-msg');

  const chapters = [
    {
      label: 'CHAPTER 1: THE ORIGIN',
      headline: 'WHERE IT ALL BEGAN',
      body: 'Founded with a simple mission: to make world-class creative tools accessible to everyone without friction or barriers.',
      quote: '“Every extraordinary journey begins with a courageous first step.”',
      bgGrad: ['#040a17', '#0e1f3d']
    },
    {
      label: 'CHAPTER 2: THE OBSTACLE',
      headline: 'RETHINKING THE STATUS QUO',
      body: 'We confronted outdated legacy workflows, high costs, and fragmented platforms that slowed teams down.',
      quote: '“Adversity introduced us to our greatest capabilities.”',
      bgGrad: ['#16081f', '#2a113c']
    },
    {
      label: 'CHAPTER 3: THE INNOVATION',
      headline: 'ENGINEERED FOR EXCELLENCE',
      body: 'We developed an all-in-one unified suite combining speed, privacy, and seamless browser-native technology.',
      quote: '“True innovation is designing complexity away into pure intuition.”',
      bgGrad: ['#051c17', '#0c382e']
    },
    {
      label: 'CHAPTER 4: THE FUTURE',
      headline: 'EMPOWERING MILLIONS WORLDWIDE',
      body: 'Today, creators, agencies, and professionals build their greatest work with our ecosystem every single day.',
      quote: '“The future does not happen to us. We build it together.”',
      bgGrad: ['#0a101d', '#1e293b']
    }
  ];

  function initAudio() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playNarrativeAudio(destNode = null) {
    initAudio();
    const dest = destNode || audioCtx.destination;
    const now = audioCtx.currentTime;

    // Inspiring harmonic narrative chords
    const progression = [
      [196.00, 246.94, 293.66], // G
      [164.81, 196.00, 246.94], // Em
      [174.61, 220.00, 261.63], // F
      [220.00, 261.63, 329.63]  // Am
    ];

    progression.forEach((chord, idx) => {
      const chStart = now + (idx * chapterDuration);
      chord.forEach(f => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, chStart);

        gain.gain.setValueAtTime(0.001, chStart);
        gain.gain.linearRampToValueAtTime(0.06, chStart + 0.6);
        gain.gain.setValueAtTime(0.06, chStart + chapterDuration - 0.6);
        gain.gain.linearRampToValueAtTime(0.001, chStart + chapterDuration);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(chStart);
        osc.stop(chStart + chapterDuration);
      });
    });
  }

  function renderFrame(progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const currentTime = progress * totalDuration;
    const chIdx = Math.min(3, Math.floor(currentTime / chapterDuration));
    const chProgress = (currentTime % chapterDuration) / chapterDuration;
    const ch = chapters[chIdx];

    // Background Gradient
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, ch.bgGrad[0]);
    bg.addColorStop(1, ch.bgGrad[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Dynamic wave grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 60; x < w; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Top Header: Brand Name & Global Timeline
    const brand = (brandNameInput.value || 'BRAND STORY').toUpperCase();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 22px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`★ ${brand}`, 80, 65);

    // Chapter Steps Progress Bar (Top Right)
    const stepW = 70;
    const stepGap = 12;
    const startX = w - 80 - (4 * stepW + 3 * stepGap);
    for (let i = 0; i < 4; i++) {
      const bx = startX + i * (stepW + stepGap);
      ctx.fillStyle = i <= chIdx ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(bx, 50, stepW, 8, 4);
      ctx.fill();
    }

    // Chapter Badge
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.roundRect(80, 150, 320, 36, 18);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ch.label, 240, 174);

    // Headline (Large Display)
    ctx.font = '900 62px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 18;
    ctx.fillText(ch.headline, 80, 260);

    // Body Paragraph (Framed Card)
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(80, 300, w - 160, 160, 16);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.font = '500 26px "Inter", sans-serif';
    ctx.fillStyle = '#e2e8f0';

    // Word wrap body text
    const words = ch.body.split(' ');
    let line = '';
    let lineY = 355;
    words.forEach(wrd => {
      const test = line + wrd + ' ';
      if (ctx.measureText(test).width > w - 240) {
        ctx.fillText(line, 110, lineY);
        line = wrd + ' ';
        lineY += 40;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, 110, lineY);

    // Quote Banner
    ctx.font = 'italic bold 24px "Instrument Serif", serif, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(ch.quote, 110, 520);

    // Bottom Subtle Progress Line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(80, h - 50, w - 160, 4);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(80, h - 50, (w - 160) * progress, 4);
  }

  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPlayStory.textContent = 'Playing Story...';
    btnPlayStory.disabled = true;

    playNarrativeAudio();

    const fps = 30;
    const totalFrames = fps * totalDuration;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);

      storyProgress.value = progress * 100;
      storyTime.textContent = `${(progress * totalDuration).toFixed(1)}s / ${totalDuration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPlayStory.textContent = 'Play Full Story';
        btnPlayStory.disabled = false;
      }
    }, 1000 / fps);
  }

  function loadChapterUI(idx) {
    activeChapter = idx;
    chapterTabs.forEach((tab, i) => {
      if (i === idx) tab.classList.add('active');
      else tab.classList.remove('active');
    });
    const ch = chapters[idx];
    chapterHeadline.value = ch.headline;
    chapterBody.value = ch.body;
    chapterQuote.value = ch.quote;
    renderFrame((idx * chapterDuration + 1.0) / totalDuration);
  }

  chapterTabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => loadChapterUI(idx));
  });

  [brandNameInput, chapterHeadline, chapterBody, chapterQuote].forEach(el => {
    el.addEventListener('input', () => {
      const ch = chapters[activeChapter];
      ch.headline = chapterHeadline.value;
      ch.body = chapterBody.value;
      ch.quote = chapterQuote.value;
      renderFrame((activeChapter * chapterDuration + 1.0) / totalDuration);
    });
  });

  btnPlayStory.addEventListener('click', playPreview);

  storyProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPlayStory.textContent = 'Play Full Story';
      btnPlayStory.disabled = false;
    }
    const progress = e.target.value / 100;
    storyTime.textContent = `${(progress * totalDuration).toFixed(1)}s / ${totalDuration.toFixed(1)}s`;
    renderFrame(progress);
  });

  // Export Brand Story Video
  btnExportStory.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportStory.disabled = true;
    renderMsg.style.display = 'block';

    initAudio();
    const stream = canvas.captureStream(30);

    const audioDest = audioCtx.createMediaStreamDestination();
    playNarrativeAudio(audioDest);
    audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const slug = (brandNameInput.value || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '_');
      a.download = `${slug}_story_video.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportStory.disabled = false;
      isRecording = false;
      renderFrame(0.1);
    };

    recorder.start();

    const fps = 30;
    const totalFrames = fps * totalDuration;
    let frame = 0;

    const recordInterval = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);
      storyProgress.value = progress * 100;
      storyTime.textContent = `${(progress * totalDuration).toFixed(1)}s / ${totalDuration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  loadChapterUI(0);
});