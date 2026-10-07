// Umrah Promo Creator - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let currentPkg = 'vip';
  let audioCtx = null;
  let animTimer = null;
  const duration = 6.0;

  const canvas = document.getElementById('umrah-canvas');
  const ctx = canvas.getContext('2d');

  const btnPlayUmrah = document.getElementById('btn-play-umrah');
  const umrahProgress = document.getElementById('umrah-progress');
  const umrahTime = document.getElementById('umrah-time');

  const pkgChips = document.querySelectorAll('.pkg-chip');
  const umrahTitle = document.getElementById('umrah-title');
  const umrahHotels = document.getElementById('umrah-hotels');
  const umrahPrice = document.getElementById('umrah-price');
  const umrahDates = document.getElementById('umrah-dates');
  const umrahInclusions = document.getElementById('umrah-inclusions');
  const umrahContact = document.getElementById('umrah-contact');

  const btnExportUmrah = document.getElementById('btn-export-umrah');
  const exportMsg = document.getElementById('export-msg');

  const PKG_CONFIGS = {
    vip: {
      title: 'EXCLUSIVE 14-DAY VIP UMRAH PACKAGE',
      hotels: 'Clock Tower Makkah (50m to Haram) • Oberoi Madinah Front View',
      price: 'FROM $1,499 / PERSON',
      dates: 'DEPARTURE: 15TH NOV 2026',
      inclusions: 'Direct Flights Included | E-Visa Processing | 5-Star Buffet | Private VIP Transport | Guided Ziyarah'
    },
    ramadan: {
      title: 'RAMADAN MUBARAK BLESSED UMRAH',
      hotels: 'Swissotel Makkah (Haram View) • Anwar Al Madinah Movenpick',
      price: 'FROM $1,899 / PERSON',
      dates: 'LAST 10 DAYS ITIKAF SPECIAL',
      inclusions: 'Suhoor & Iftar Buffets | Fast-Track E-Visa | Daily Religious Seminars | Direct Saudia Flights'
    },
    economy: {
      title: 'AFFORDABLE FAMILY GROUP UMRAH',
      hotels: '4-Star Makkah Shuttle Hotel (3 Min) • 4-Star Central Madinah Hotel',
      price: 'FROM $899 / PERSON',
      dates: 'MULTIPLE DEPARTURE DATES',
      inclusions: 'Air Ticket Included | Group Visa Support | AC Bus Transfers | Experienced Group Leader'
    },
    hajj: {
      title: 'EXECUTIVE VIP HAJJ JOURNEY 2027',
      hotels: 'Fairmont Clock Tower • Mina Luxury Air-Conditioned Tents',
      price: 'ALL-INCLUSIVE EXECUTIVE',
      dates: 'REGISTRATION NOW OPEN',
      inclusions: 'VIP Train Travel | Dedicated Scholar Support | Private En-Suite Tents | Full Healthcare Support'
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

  // Spiritual peaceful ambient soundscape
  function playSpiritualAudio(destNode = null) {
    initAudio();
    const dest = destNode || audioCtx.destination;
    const now = audioCtx.currentTime;

    // Peaceful meditative drone in D (Oud/ambient mood): D2, A2, D3, F#3
    const freqs = [73.42, 110.00, 146.83, 185.00];
    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 1.2 + idx * 0.2);
      gain.gain.setValueAtTime(0.07, now + duration - 1.2);
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

    // Deep Spiritual Midnight Navy & Gold Gradient
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#040b17');
    bg.addColorStop(0.5, '#0a1628');
    bg.addColorStop(1, '#02050b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Animated Golden Shimmer Particles
    for (let i = 0; i < 40; i++) {
      const px = (Math.sin(i * 14.2 + progress * 2) * 0.5 + 0.5) * w;
      const py = (Math.cos(i * 8.7 + progress * 1.5) * 0.5 + 0.5) * h;
      ctx.fillStyle = `rgba(245, 158, 11, ${0.1 + (i % 3) * 0.1})`;
      ctx.beginPath();
      ctx.arc(px, py, 2 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }

    // Islamic Arch Decorative Border
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Inner gold corner ornaments
    const corners = [
      { x: 40, y: 40 },
      { x: w - 40, y: 40 },
      { x: 40, y: h - 40 },
      { x: w - 40, y: h - 40 }
    ];
    corners.forEach(c => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Top Bismillah / Crescent Motif
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌙 🕋', w / 2, 95);

    // Main Package Title
    const title = (umrahTitle.value || 'EXCLUSIVE UMRAH PACKAGE').toUpperCase();
    ctx.font = 'bold 46px "Instrument Serif", serif, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(234, 179, 8, 0.5)';
    ctx.shadowBlur = 18;
    ctx.fillText(title, w / 2, 170);

    // Hotels & Proximity Banner
    ctx.shadowBlur = 0;
    const hotels = umrahHotels.value || 'Clock Tower Makkah & Madinah Haram View';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 420, 205, 840, 46, 23);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '600 20px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(hotels, w / 2, 235);

    // Price Pill & Departure Date
    const price = umrahPrice.value || '$1,499 / Person';
    const dates = umrahDates.value || 'DEPARTURE: NOV 2026';

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 320, 280, 300, 60, 14);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '900 22px "Inter", sans-serif';
    ctx.fillText(price, w / 2 - 170, 318);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(w / 2 + 20, 280, 300, 60, 14);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 18px "Inter", sans-serif';
    ctx.fillText(dates, w / 2 + 170, 318);

    // Inclusions List
    const inclusions = (umrahInclusions.value || '').split('|');
    let incY = 385;
    inclusions.forEach(item => {
      const clean = item.trim();
      if (!clean) return;

      ctx.font = '500 18px "Inter", sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`✓ ${clean}`, w / 2, incY);
      incY += 34;
    });

    // Bottom Contact Hotline
    ctx.fillStyle = 'rgba(5, 8, 15, 0.95)';
    ctx.fillRect(40, h - 90, w - 80, 50);

    const contact = umrahContact.value || 'Call / WhatsApp for Booking';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(contact, w / 2, h - 58);
  }

  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPlayUmrah.textContent = 'Playing...';
    btnPlayUmrah.disabled = true;

    playSpiritualAudio();

    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);

      umrahProgress.value = progress * 100;
      umrahTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPlayUmrah.textContent = 'Play Promo';
        btnPlayUmrah.disabled = false;
      }
    }, 1000 / fps);
  }

  pkgChips.forEach(chip => {
    chip.addEventListener('click', () => {
      pkgChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentPkg = chip.dataset.pkg;

      const cfg = PKG_CONFIGS[currentPkg];
      if (cfg) {
        umrahTitle.value = cfg.title;
        umrahHotels.value = cfg.hotels;
        umrahPrice.value = cfg.price;
        umrahDates.value = cfg.dates;
        umrahInclusions.value = cfg.inclusions;
      }
      renderFrame(0.5);
    });
  });

  [umrahTitle, umrahHotels, umrahPrice, umrahDates, umrahInclusions, umrahContact].forEach(el => {
    el.addEventListener('input', () => renderFrame(0.5));
  });

  btnPlayUmrah.addEventListener('click', playPreview);

  umrahProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPlayUmrah.textContent = 'Play Promo';
      btnPlayUmrah.disabled = false;
    }
    const progress = e.target.value / 100;
    umrahTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;
    renderFrame(progress);
  });

  // Export Video
  btnExportUmrah.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportUmrah.disabled = true;
    exportMsg.style.display = 'block';

    initAudio();
    const stream = canvas.captureStream(30);

    const audioDest = audioCtx.createMediaStreamDestination();
    playSpiritualAudio(audioDest);
    audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `umrah_promo_${currentPkg}.webm`;
      a.click();

      exportMsg.style.display = 'none';
      btnExportUmrah.disabled = false;
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
      umrahProgress.value = progress * 100;
      umrahTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  renderFrame(0.5);
});