// Visa Service Promo Creator - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let currentCountry = 'schengen';
  let audioCtx = null;
  let animTimer = null;
  const duration = 6.0;

  const canvas = document.getElementById('visa-canvas');
  const ctx = canvas.getContext('2d');

  const btnPlayVisa = document.getElementById('btn-play-visa');
  const visaProgress = document.getElementById('visa-progress');
  const visaTime = document.getElementById('visa-time');

  const countryChips = document.querySelectorAll('.country-chip');
  const visaAgency = document.getElementById('visa-agency');
  const visaHeadline = document.getElementById('visa-headline');
  const visaRate = document.getElementById('visa-rate');
  const visaSpeed = document.getElementById('visa-speed');
  const visaServices = document.getElementById('visa-services');
  const visaContact = document.getElementById('visa-contact');

  const btnExportVisa = document.getElementById('btn-export-visa');
  const exportMsg = document.getElementById('export-msg');

  const COUNTRY_CONFIGS = {
    schengen: {
      headline: 'SCHENGEN VISA APPLICATION ASSISTANCE',
      rate: '99.2% APPROVAL RATE',
      speed: 'EXPRESS 48H APPOINTMENT',
      services: 'Document Verification • Embassy Appointments • Mock Interview • Flight Reservation',
      flag: '🇪🇺',
      primaryColor: '#38bdf8'
    },
    canada: {
      headline: 'CANADA VISITOR & WORK PERMIT EXPERTS',
      rate: '98.8% APPROVAL RATE',
      speed: 'FAST-TRACK PROCESSING',
      services: 'Biometrics Prep • Legal Documentation • Invitation Letter Review • Family Sponsorship',
      flag: '🇨🇦',
      primaryColor: '#ef4444'
    },
    usa: {
      headline: 'USA B1/B2 VISA CONSULTATION & SLOTS',
      rate: '97.9% APPROVAL RATE',
      speed: 'EXPEDITED INTERVIEW SLOTS',
      services: 'DS-160 Form Review • 1-on-1 Mock Interview • Financial Proof Audit • Refusal Re-Application',
      flag: '🇺🇸',
      primaryColor: '#3b82f6'
    },
    uk: {
      headline: 'UK STANDARD VISITOR & BUSINESS VISA',
      rate: '99.0% APPROVAL RATE',
      speed: '5-DAY PRIORITY SERVICE',
      services: 'VFS Document Upload • Financial Sponsor Review • Itinerary Structuring • Priority Support',
      flag: '🇬🇧',
      primaryColor: '#a855f7'
    }
  };

  function initAudio() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playCorporateAudio(destNode = null) {
    initAudio();
    const dest = destNode || audioCtx.destination;
    const now = audioCtx.currentTime;

    // Confident, uplifting chords in F Major: F, A, C
    const freqs = [174.61, 220.00, 261.63, 349.23];
    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.8 + idx * 0.15);
      gain.gain.setValueAtTime(0.06, now + duration - 0.8);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  function renderFrame(progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cfg = COUNTRY_CONFIGS[currentCountry];
    const themeColor = cfg ? cfg.primaryColor : '#38bdf8';

    // Corporate Navy Gradient
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#040b17');
    bg.addColorStop(0.5, '#0b162c');
    bg.addColorStop(1, '#020610');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle security grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 0; x < w; x += 50) {
      for (let y = 0; y < h; y += 50) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // Top Brand Header Bar
    const agencyName = (visaAgency.value || 'GLOBAL VISA EXPERTS').toUpperCase();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🛡️ ${agencyName}`, 80, 70);

    // Official Trust Badge (Top Right)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(w - 380, 44, 300, 36, 18);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED IMMIGRATION CONSULTANTS', w - 230, 67);

    // Large Animated Destination Shield Badge
    const flagEmoji = cfg ? cfg.flag : '🌐';
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(flagEmoji, 80, 180);

    // Main Visa Headline
    const headline = (visaHeadline.value || 'VISA APPLICATION SERVICE').toUpperCase();
    ctx.font = '900 48px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 16;
    ctx.fillText(headline, 80, 240);

    // Trust Pill 1: Approval Rate
    ctx.shadowBlur = 0;
    const rateText = visaRate.value || '99% APPROVAL RATE';
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(80, 280, 280, 48, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✓ ${rateText}`, 220, 310);

    // Trust Pill 2: Speed
    const speedText = visaSpeed.value || 'EXPRESS BOOKING';
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.roundRect(380, 280, 280, 48, 12);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText(`⚡ ${speedText}`, 520, 310);

    // Services Breakdown Cards
    const serviceItems = (visaServices.value || '').split('•');
    let sY = 380;
    serviceItems.forEach((item, idx) => {
      const clean = item.trim();
      if (!clean) return;

      const cardAlpha = Math.min(1.0, progress * 4 - idx * 0.2);
      ctx.fillStyle = `rgba(15, 23, 42, ${Math.max(0, cardAlpha * 0.8)})`;
      ctx.beginPath();
      ctx.roundRect(80, sY, w - 160, 42, 8);
      ctx.fill();

      ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, cardAlpha * 0.3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, cardAlpha)})`;
      ctx.font = '600 18px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`• ${clean}`, 110, sY + 27);

      sY += 54;
    });

    // Bottom Contact & Consultation Hotline Bar
    ctx.fillStyle = 'rgba(10, 15, 26, 0.95)';
    ctx.fillRect(0, h - 80, w, 80);

    const contactText = visaContact.value || 'Call Now for Free Consultation';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(contactText, w / 2, h - 38);
  }

  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPlayVisa.textContent = 'Playing...';
    btnPlayVisa.disabled = true;

    playCorporateAudio();

    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);

      visaProgress.value = progress * 100;
      visaTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPlayVisa.textContent = 'Play Video Ad';
        btnPlayVisa.disabled = false;
      }
    }, 1000 / fps);
  }

  countryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      countryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCountry = chip.dataset.country;

      const cfg = COUNTRY_CONFIGS[currentCountry];
      if (cfg) {
        visaHeadline.value = cfg.headline;
        visaRate.value = cfg.rate;
        visaSpeed.value = cfg.speed;
        visaServices.value = cfg.services;
      }
      renderFrame(0.5);
    });
  });

  [visaAgency, visaHeadline, visaRate, visaSpeed, visaServices, visaContact].forEach(el => {
    el.addEventListener('input', () => renderFrame(0.5));
  });

  btnPlayVisa.addEventListener('click', playPreview);

  visaProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPlayVisa.textContent = 'Play Video Ad';
      btnPlayVisa.disabled = false;
    }
    const progress = e.target.value / 100;
    visaTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;
    renderFrame(progress);
  });

  // Export Video Ad
  btnExportVisa.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportVisa.disabled = true;
    exportMsg.style.display = 'block';

    initAudio();
    const stream = canvas.captureStream(30);

    const audioDest = audioCtx.createMediaStreamDestination();
    playCorporateAudio(audioDest);
    audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `visa_promo_${currentCountry}.webm`;
      a.click();

      exportMsg.style.display = 'none';
      btnExportVisa.disabled = false;
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
      visaProgress.value = progress * 100;
      visaTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  renderFrame(0.5);
});