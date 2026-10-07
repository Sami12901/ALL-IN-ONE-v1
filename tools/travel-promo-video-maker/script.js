// Travel Promo Video Maker - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let currentDest = 'bali';
  let audioCtx = null;
  let animTimer = null;
  const duration = 6.0;

  const canvas = document.getElementById('promo-canvas');
  const ctx = canvas.getContext('2d');

  const btnPlayPromo = document.getElementById('btn-play-promo');
  const promoProgress = document.getElementById('promo-progress');
  const promoTime = document.getElementById('promo-time');

  const destCards = document.querySelectorAll('.dest-card');
  const destTitle = document.getElementById('dest-title');
  const destSub = document.getElementById('dest-sub');
  const destPrice = document.getElementById('dest-price');
  const destDiscount = document.getElementById('dest-discount');
  const destInclusions = document.getElementById('dest-inclusions');
  const destCta = document.getElementById('dest-cta');

  const btnExportPromo = document.getElementById('btn-export-promo');
  const exportMsg = document.getElementById('export-msg');

  const DEST_CONFIGS = {
    bali: {
      title: 'BALI, INDONESIA',
      sub: '5 DAYS / 4 NIGHTS ALL-INCLUSIVE RETREAT',
      price: '$699 / Person',
      discount: 'SAVE 35% TODAY',
      inclusions: 'Flights Included | 5-Star Resort | Free Breakfast | VIP Tours'
    },
    swiss: {
      title: 'SWISS ALPS, SWITZERLAND',
      sub: '7 DAYS LUXURY MOUNTAIN CHALET ESCAPE',
      price: '$1,299 / Person',
      discount: 'EARLY BIRD SPECIAL',
      inclusions: 'Glacier Express | 5-Star Chalet | Ski Passes | Gourmet Dining'
    },
    maldives: {
      title: 'MALDIVES ATOLL VIP',
      sub: '5-STAR OVERWATER PRIVATE POOL VILLA',
      price: '$1,899 / Person',
      discount: 'LIMITED LUXURY OFFER',
      inclusions: 'Seaplane Transfers | All-Inclusive Spa | Private Butler | Sunset Cruise'
    },
    tokyo: {
      title: 'TOKYO & KYOTO, JAPAN',
      sub: '8-DAY ULTRA CULTURE & CULINARY TOUR',
      price: '$999 / Person',
      discount: 'TOP SELLING TOUR',
      inclusions: 'Shinkansen Bullet Train | Luxury Hotels | English Guide | Food Tours'
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

  // Synthesize relaxing vacation ambient pad
  function playTravelMusic(destNode = null) {
    initAudio();
    const dest = destNode || audioCtx.destination;
    const now = audioCtx.currentTime;

    // Tropical Pentatonic harmony: C4, D4, E4, G4, A4
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 1.0 + idx * 0.2);
      gain.gain.setValueAtTime(0.06, now + duration - 1.0);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // Draw procedural travel scenery with Ken Burns camera motion
  function renderFrame(progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Ken Burns zoom scale: 1.0 -> 1.15
    const zoom = 1.0 + progress * 0.15;
    const panX = (progress - 0.5) * 40;

    ctx.save();
    ctx.translate(w / 2 + panX, h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-w / 2, -h / 2);

    // Background Scenic Art
    if (currentDest === 'bali') {
      // Tropical Sunset Gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#f97316');
      sky.addColorStop(0.4, '#e11d48');
      sky.addColorStop(0.7, '#4c1d95');
      sky.addColorStop(1, '#0f172a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Glowing Sun
      const sun = ctx.createRadialGradient(w * 0.7, h * 0.45, 10, w * 0.7, h * 0.45, 120);
      sun.addColorStop(0, '#ffedd5');
      sun.addColorStop(0.5, '#fde047');
      sun.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.45, 120, 0, Math.PI * 2);
      ctx.fill();

      // Ocean water reflection
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(0, h * 0.55, w, h * 0.45);

    } else if (currentDest === 'swiss') {
      // Alpine Sky & Mountain Peaks
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#0284c7');
      sky.addColorStop(0.6, '#38bdf8');
      sky.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Mountain silhouttes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * 0.25, h * 0.35);
      ctx.lineTo(w * 0.5, h * 0.65);
      ctx.lineTo(w * 0.75, h * 0.3);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

    } else if (currentDest === 'maldives') {
      // Turquoise Lagoon
      const lagoon = ctx.createLinearGradient(0, 0, 0, h);
      lagoon.addColorStop(0, '#06b6d4');
      lagoon.addColorStop(0.5, '#0891b2');
      lagoon.addColorStop(1, '#0e7490');
      ctx.fillStyle = lagoon;
      ctx.fillRect(0, 0, w, h);

      // Shimmering sun rays
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.5, 0);
        ctx.lineTo(i * 200, h);
        ctx.lineTo(i * 200 + 80, h);
        ctx.closePath();
        ctx.fill();
      }

    } else {
      // Tokyo Cyberpunk Neon
      ctx.fillStyle = '#090514';
      ctx.fillRect(0, 0, w, h);

      // Neon Skyline Blocks
      for (let i = 0; i < 18; i++) {
        const bh = 180 + (i % 6) * 50;
        ctx.fillStyle = i % 2 === 0 ? '#1e1b4b' : '#312e81';
        ctx.fillRect(i * 75, h - bh, 65, bh);

        // Windows
        ctx.fillStyle = i % 3 === 0 ? '#f43f5e' : '#38bdf8';
        for (let wy = h - bh + 20; wy < h - 40; wy += 35) {
          ctx.fillRect(i * 75 + 15, wy, 12, 16);
          ctx.fillRect(i * 75 + 38, wy, 12, 16);
        }
      }
    }
    ctx.restore();

    // Dark Gradient Overlay for text readability
    const darkOverlay = ctx.createLinearGradient(0, 0, 0, h);
    darkOverlay.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    darkOverlay.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)');
    darkOverlay.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = darkOverlay;
    ctx.fillRect(0, 0, w, h);

    // Discount Badge (Top Right)
    const discountText = destDiscount.value || 'SPECIAL OFFER';
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(w - 320, 40, 270, 48, 24);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(discountText, w - 185, 64);

    // Main Destination Title
    const title = (destTitle.value || 'DREAM VACATION').toUpperCase();
    ctx.font = '900 68px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 24;
    ctx.fillText(title, 80, 260);

    // Subtitle
    const sub = destSub.value || 'ALL-INCLUSIVE VACATION PACKAGE';
    ctx.font = '600 24px "Inter", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fillText(sub, 80, 310);

    // Price Display
    const price = destPrice.value || '$799 / Person';
    ctx.font = '900 52px "Inter", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.shadowBlur = 16;
    ctx.fillText(price, 80, 390);

    // Inclusions List Pills
    const incItems = (destInclusions.value || '').split('|');
    let incX = 80;
    ctx.shadowBlur = 0;
    incItems.forEach(item => {
      const cleanItem = item.trim();
      if (!cleanItem) return;
      ctx.font = '600 16px "Inter", sans-serif';
      const tw = ctx.measureText(cleanItem).width;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(incX, 430, tw + 28, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(cleanItem, incX + 14, 453);
      incX += tw + 40;
    });

    // Bottom Booking Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, h - 80, w, 80);

    const cta = destCta.value || 'Book Now: www.travelagency.com';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cta, w / 2, h - 40);
  }

  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPlayPromo.textContent = 'Playing...';
    btnPlayPromo.disabled = true;

    playTravelMusic();

    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);

      promoProgress.value = progress * 100;
      promoTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPlayPromo.textContent = 'Play Promo';
        btnPlayPromo.disabled = false;
      }
    }, 1000 / fps);
  }

  destCards.forEach(card => {
    card.addEventListener('click', () => {
      destCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentDest = card.dataset.dest;

      const cfg = DEST_CONFIGS[currentDest];
      if (cfg) {
        destTitle.value = cfg.title;
        destSub.value = cfg.sub;
        destPrice.value = cfg.price;
        destDiscount.value = cfg.discount;
        destInclusions.value = cfg.inclusions;
      }
      renderFrame(0.5);
    });
  });

  [destTitle, destSub, destPrice, destDiscount, destInclusions, destCta].forEach(el => {
    el.addEventListener('input', () => renderFrame(0.5));
  });

  btnPlayPromo.addEventListener('click', playPreview);

  promoProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPlayPromo.textContent = 'Play Promo';
      btnPlayPromo.disabled = false;
    }
    const progress = e.target.value / 100;
    promoTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;
    renderFrame(progress);
  });

  // Export Promo Video
  btnExportPromo.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportPromo.disabled = true;
    exportMsg.style.display = 'block';

    initAudio();
    const stream = canvas.captureStream(30);

    const audioDest = audioCtx.createMediaStreamDestination();
    playTravelMusic(audioDest);
    audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `travel_promo_${currentDest}.webm`;
      a.click();

      exportMsg.style.display = 'none';
      btnExportPromo.disabled = false;
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
      promoProgress.value = progress * 100;
      promoTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  renderFrame(0.5);
});