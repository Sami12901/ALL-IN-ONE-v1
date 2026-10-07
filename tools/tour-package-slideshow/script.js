// Tour Package Slideshow Video Maker - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let currentSlideIndex = 0;
  let audioCtx = null;
  let animTimer = null;

  let slides = [
    {
      title: 'DISCOVER GOLDEN DUBAI',
      tag: '5 DAYS / 4 NIGHTS LUXURY TOUR',
      desc: 'Experience Burj Khalifa, Desert Safari, Marina Yacht Cruise & Luxury Souks',
      bgGrad: ['#0f172a', '#1e293b', '#d97706'],
      icon: '🏙️'
    },
    {
      title: '5-STAR PALACE ACCOMMODATION',
      tag: 'PREMIUM HOSPITALITY',
      desc: 'Complimentary International Buffet Breakfast & Infinity Pool Access',
      bgGrad: ['#090d16', '#142036', '#0284c7'],
      icon: '🏨'
    },
    {
      title: 'CURATED PRIVATE EXPERIENCES',
      tag: 'VIP EXCURSIONS INCLUDED',
      desc: 'Sunset Dune Bashing, Camel Riding, BBQ Dinner & Cultural Shows',
      bgGrad: ['#1c1007', '#361b07', '#ea580c'],
      icon: '🐪'
    },
    {
      title: 'ALL-INCLUSIVE FROM $899',
      tag: 'LIMITED SEASON SPECIAL',
      desc: 'Flights, Visa, 5-Star Hotel & VIP Transfers Included • Call +1 (800) 555-TOUR',
      bgGrad: ['#062419', '#0b3d2b', '#10b981'],
      icon: '✈️'
    }
  ];

  const canvas = document.getElementById('slide-canvas');
  const ctx = canvas.getContext('2d');

  const btnPlayShow = document.getElementById('btn-play-show');
  const showProgress = document.getElementById('show-progress');
  const showTime = document.getElementById('show-time');
  const currentSlideLabel = document.getElementById('current-slide-label');
  const btnPrevSlide = document.getElementById('btn-prev-slide');
  const btnNextSlide = document.getElementById('btn-next-slide');

  const slidesList = document.getElementById('slides-list');
  const btnAddSlide = document.getElementById('btn-add-slide');
  const editTitle = document.getElementById('edit-title');
  const editTag = document.getElementById('edit-tag');
  const editDesc = document.getElementById('edit-desc');

  const selectTransition = document.getElementById('select-transition');
  const selectSlideDur = document.getElementById('select-slide-dur');

  const btnExportSlideshow = document.getElementById('btn-export-slideshow');
  const renderMsg = document.getElementById('render-msg');

  function getTotalDuration() {
    const durPerSlide = parseFloat(selectSlideDur.value);
    return slides.length * durPerSlide;
  }

  function initAudio() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSlideshowMusic(destNode = null) {
    initAudio();
    const dest = destNode || audioCtx.destination;
    const totalDur = getTotalDuration();
    const now = audioCtx.currentTime;

    // Upbeat presentation arpeggio in D Major
    const freqs = [293.66, 369.99, 440.00, 587.33];
    const noteLen = 0.5;
    const noteCount = Math.floor(totalDur / noteLen);

    for (let i = 0; i < noteCount; i++) {
      const noteTime = now + (i * noteLen);
      const freq = freqs[i % freqs.length];
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.04, noteTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteLen * 0.9);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(noteTime);
      osc.stop(noteTime + noteLen);
    }
  }

  function drawSlideContent(slide, alpha = 1.0, offsetX = 0, scale = 1.0) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.translate(w / 2 + offsetX, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, slide.bgGrad[0]);
    grad.addColorStop(0.6, slide.bgGrad[1]);
    grad.addColorStop(1, slide.bgGrad[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle modern grid pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 0; x < w; x += 60) {
      for (let y = 0; y < h; y += 60) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Glass Card Frame
    const cardX = 140;
    const cardY = 120;
    const cardW = w - 280;
    const cardH = h - 240;

    ctx.fillStyle = 'rgba(10, 15, 26, 0.7)';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 24);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Large Emoji / Icon Badge
    ctx.font = '72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(slide.icon || '✈️', w / 2, cardY + 90);

    // Tagline Pill
    ctx.fillStyle = 'rgba(78, 133, 191, 0.3)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 200, cardY + 160, 400, 36, 18);
    ctx.fill();

    ctx.font = '700 16px "Inter", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(slide.tag, w / 2, cardY + 178);

    // Main Slide Title
    ctx.font = '900 52px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 18;
    ctx.fillText(slide.title, w / 2, cardY + 250);

    // Description
    ctx.shadowBlur = 0;
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(slide.desc, w / 2, cardY + 310);

    ctx.restore();
  }

  function renderSlideshow(progress) {
    const totalDur = getTotalDuration();
    const durPerSlide = parseFloat(selectSlideDur.value);
    const currentTime = progress * totalDur;

    const slideIdx = Math.min(slides.length - 1, Math.floor(currentTime / durPerSlide));
    const slideTime = currentTime % durPerSlide;
    const transitionTime = 0.6; // 0.6s transition
    const transType = selectTransition.value;

    const currentSlide = slides[slideIdx];
    const nextSlide = slides[(slideIdx + 1) % slides.length];

    if (slideTime > durPerSlide - transitionTime && slideIdx < slides.length - 1) {
      // Transitioning
      const transProgress = (slideTime - (durPerSlide - transitionTime)) / transitionTime;

      if (transType === 'slide') {
        drawSlideContent(currentSlide, 1.0, -transProgress * canvas.width, 1.0);
        drawSlideContent(nextSlide, 1.0, (1 - transProgress) * canvas.width, 1.0);
      } else if (transType === 'zoom') {
        drawSlideContent(currentSlide, 1 - transProgress, 0, 1.0 + transProgress * 0.2);
        drawSlideContent(nextSlide, transProgress, 0, 0.8 + transProgress * 0.2);
      } else {
        // Crossfade
        drawSlideContent(currentSlide, 1.0);
        drawSlideContent(nextSlide, transProgress);
      }
    } else {
      // Normal display
      drawSlideContent(currentSlide, 1.0, 0, 1.0 + (slideTime / durPerSlide) * 0.04);
    }

    currentSlideIndex = slideIdx;
    currentSlideLabel.textContent = `Slide ${slideIdx + 1} of ${slides.length}: ${currentSlide.title}`;
    highlightActiveSlideInList();
  }

  function updateSlideListUI() {
    slidesList.innerHTML = '';
    slides.forEach((s, idx) => {
      const item = document.createElement('div');
      item.className = `slide-item ${idx === currentSlideIndex ? 'active' : ''}`;
      item.dataset.index = idx;
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 0.85rem;">${idx + 1}. ${s.icon} ${s.title}</span>
          ${slides.length > 1 ? `<button class="btn btn-secondary del-btn" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: var(--danger);">&times;</button>` : ''}
        </div>
      `;
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('del-btn')) {
          currentSlideIndex = idx;
          loadSlideIntoEditor(idx);
          drawSlideContent(slides[idx]);
          highlightActiveSlideInList();
        }
      });
      const delBtn = item.querySelector('.del-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          slides.splice(idx, 1);
          currentSlideIndex = Math.max(0, currentSlideIndex - 1);
          updateSlideListUI();
          loadSlideIntoEditor(currentSlideIndex);
          drawSlideContent(slides[currentSlideIndex]);
        });
      }
      slidesList.appendChild(item);
    });
  }

  function highlightActiveSlideInList() {
    document.querySelectorAll('.slide-item').forEach((item, idx) => {
      if (idx === currentSlideIndex) item.classList.add('active');
      else item.classList.remove('active');
    });
  }

  function loadSlideIntoEditor(idx) {
    const s = slides[idx];
    if (s) {
      editTitle.value = s.title;
      editTag.value = s.tag;
      editDesc.value = s.desc;
    }
  }

  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPlayShow.textContent = 'Playing...';
    btnPlayShow.disabled = true;

    playSlideshowMusic();

    const totalDur = getTotalDuration();
    const fps = 30;
    const totalFrames = fps * totalDur;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderSlideshow(progress);

      showProgress.value = progress * 100;
      showTime.textContent = `${(progress * totalDur).toFixed(1)}s / ${totalDur.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPlayShow.textContent = 'Play Slideshow';
        btnPlayShow.disabled = false;
      }
    }, 1000 / fps);
  }

  btnAddSlide.addEventListener('click', () => {
    slides.push({
      title: 'SPECIAL INCLUDED BENEFIT',
      tag: 'NEW HIGHLIGHT',
      desc: 'Customize this tour slide description with activities or deals',
      bgGrad: ['#0f172a', '#1e293b', '#4e85bf'],
      icon: '✨'
    });
    currentSlideIndex = slides.length - 1;
    updateSlideListUI();
    loadSlideIntoEditor(currentSlideIndex);
    drawSlideContent(slides[currentSlideIndex]);
  });

  [editTitle, editTag, editDesc].forEach(el => {
    el.addEventListener('input', () => {
      const s = slides[currentSlideIndex];
      if (s) {
        s.title = editTitle.value;
        s.tag = editTag.tag = editTag.value;
        s.desc = editDesc.value;
        drawSlideContent(s);
        updateSlideListUI();
      }
    });
  });

  btnPrevSlide.addEventListener('click', () => {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    loadSlideIntoEditor(currentSlideIndex);
    drawSlideContent(slides[currentSlideIndex]);
    highlightActiveSlideInList();
  });

  btnNextSlide.addEventListener('click', () => {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    loadSlideIntoEditor(currentSlideIndex);
    drawSlideContent(slides[currentSlideIndex]);
    highlightActiveSlideInList();
  });

  btnPlayShow.addEventListener('click', playPreview);

  showProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPlayShow.textContent = 'Play Slideshow';
      btnPlayShow.disabled = false;
    }
    const progress = e.target.value / 100;
    const totalDur = getTotalDuration();
    showTime.textContent = `${(progress * totalDur).toFixed(1)}s / ${totalDur.toFixed(1)}s`;
    renderSlideshow(progress);
  });

  // Export Video Slideshow
  btnExportSlideshow.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportSlideshow.disabled = true;
    renderMsg.style.display = 'block';

    initAudio();
    const totalDur = getTotalDuration();
    const stream = canvas.captureStream(30);

    const audioDest = audioCtx.createMediaStreamDestination();
    playSlideshowMusic(audioDest);
    audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `tour_package_slideshow_${totalDur}s.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportSlideshow.disabled = false;
      isRecording = false;
      drawSlideContent(slides[currentSlideIndex]);
    };

    recorder.start();

    const fps = 30;
    const totalFrames = fps * totalDur;
    let frame = 0;

    const recordInterval = setInterval(() => {
      const progress = frame / totalFrames;
      renderSlideshow(progress);
      showProgress.value = progress * 100;
      showTime.textContent = `${(progress * totalDur).toFixed(1)}s / ${totalDur.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  updateSlideListUI();
  loadSlideIntoEditor(0);
  drawSlideContent(slides[0]);
});