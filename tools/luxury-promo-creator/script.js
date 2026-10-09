// Luxury Brand Promo Video Creator - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let currentAsset = 'penthouse';
  let audioCtx = null;
  let animTimer = null;
  const duration = 6.0;

  const canvas = document.getElementById('luxe-canvas');
  const ctx = canvas.getContext('2d');

  const btnPlayLuxe = document.getElementById('btn-play-luxe');
  const luxeProgress = document.getElementById('luxe-progress');
  const luxeTime = document.getElementById('luxe-time');

  const luxeCards = document.querySelectorAll('.luxe-card');
  const luxeBrand = document.getElementById('luxe-brand');
  const luxeSlogan = document.getElementById('luxe-slogan');
  const luxeAttributes = document.getElementById('luxe-attributes');
  const luxePrice = document.getElementById('luxe-price');
  const luxeTag = document.getElementById('luxe-tag');
  const luxeContact = document.getElementById('luxe-contact');

  const btnExportLuxe = document.getElementById('btn-export-luxe');
  const exportMsg = document.getElementById('export-msg');

  const ASSET_CONFIGS = {
    penthouse: {
      brand: 'THE AURELIA RESIDENCES',
      slogan: 'BEYOND PERFECTION • THE PINNACLE OF SKYLINE LIVING',
      attributes: 'Private Infinity Pool | Helipad Access | 360 Panoramic Views | Dedicated Concierge',
      price: 'OFFERED AT $28,500,000',
      tag: 'PRIVATE VIEWINGS ONLY'
    },
    yacht: {
      brand: 'M/Y CELESTIAL MAJESTY',
      slogan: 'UNRESTRICTED FREEDOM • 85M BESPOKE SUPERYACHT',
      attributes: 'Beach Club & Spa | Helicopter Deck | Master Stateroom Balcony | 24 Professional Crew',
      price: 'CHARTER FROM €650,000 / WEEK',
      tag: 'MEDITERRANEAN & CARIBBEAN'
    },
    watch: {
      brand: 'CHRONOS ROYAL TOURBILLON',
      slogan: 'A MONUMENT TO TIME • LIMITED TO 18 PIECES WORLDWIDE',
      attributes: 'Hand-Finished Titanium | Double Tourbillon | 72-Hour Power Reserve | Sapphire Crystal',
      price: 'PRICE UPON APPLICATION',
      tag: 'GENEVA MASTERPIECE'
    },
    island: {
      brand: 'ISLA DE LA LUNA PRIVATE ESTATE',
      slogan: 'ULTIMATE SANCTUARY • 150 ACRES OF UNTOUCHED PARADISE',
      attributes: 'Private Deep-Water Marina | 6 Luxury Guest Villas | White Sand Coastline | 100% Solar Powered',
      price: 'PRICE UPON INQUIRY',
      tag: 'GLOBAL EXCLUSIVE LISTING'
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

  function playLuxuryAudio(destNode = null) {
    initAudio();
    const dest = destNode || audioCtx.destination;
    const now = audioCtx.currentTime;

    // Deep cinematic resonant cello chord: C2, G2, E3, B3
    const freqs = [65.41, 98.00, 164.81, 246.94];
    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 1.2 + idx * 0.2);
      gain.gain.setValueAtTime(0.06, now + duration - 1.2);
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

    // Deep Obsidian / Noir Background with subtle radial gold ambient light
    const bg = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w / 1.4);
    bg.addColorStop(0, '#120f09');
    bg.addColorStop(0.6, '#080705');
    bg.addColorStop(1, '#020202');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Floating Golden Bokeh Dust
    for (let i = 0; i < 45; i++) {
      const px = (Math.sin(i * 18.2 + progress * 2.2) * 0.5 + 0.5) * w;
      const py = (Math.cos(i * 11.4 + progress * 1.6) * 0.5 + 0.5) * h;
      const pr = 2 + (i % 6);
      ctx.fillStyle = `rgba(212, 175, 55, ${0.1 + (i % 4) * 0.08})`;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anamorphic horizontal gold lens flare beam
    const flareY = h * 0.42;
    const flareGrad = ctx.createLinearGradient(0, flareY, w, flareY);
    flareGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
    flareGrad.addColorStop(0.5, `rgba(254, 240, 138, ${0.25 + 0.15 * Math.sin(progress * Math.PI)})`);
    flareGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, flareY - 2, w, 4);

    // Elegant Double Gold Border Frame
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, w - 100, h - 100);
    ctx.strokeRect(58, 58, w - 116, h - 116);

    // Monogram Brand Emblem
    const brand = (luxeBrand.value || 'THE AURELIA RESIDENCES').toUpperCase();
    ctx.font = '300 24px "Inter", sans-serif';
    ctx.letterSpacing = '12px';
    ctx.fillStyle = '#d4af37';
    ctx.textAlign = 'center';
    ctx.fillText('— EXCLUSIVE COLLECTION —', w / 2, 115);

    // Main Title in luxury Serif
    ctx.letterSpacing = '2px';
    ctx.font = 'bold 56px "Instrument Serif", serif, sans-serif';
    const goldGrad = ctx.createLinearGradient(w / 2 - 300, 0, w / 2 + 300, 0);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#d4af37');
    goldGrad.addColorStop(1, '#aa820a');
    ctx.fillStyle = goldGrad;
    ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillText(brand, w / 2, 185);

    // Slogan Subtitle
    ctx.shadowBlur = 0;
    const slogan = (luxeSlogan.value || 'THE PINNACLE OF LUXURY').toUpperCase();
    ctx.font = '500 18px "Inter", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(slogan, w / 2, 235);

    // Attributes Pill Box
    const attributes = (luxeAttributes.value || '').split('|');
    let attrY = 295;
    attributes.forEach(attr => {
      const clean = attr.trim();
      if (!clean) return;

      ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 360, attrY, 720, 36, 18);
      ctx.fill();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '600 16px "Inter", sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.letterSpacing = '1px';
      ctx.fillText(clean, w / 2, attrY + 23);

      attrY += 46;
    });

    // Price & Availability Tag
    const price = luxePrice.value || 'PRICE UPON REQUEST';
    const tag = luxeTag.value || 'PRIVATE VIEWINGS ONLY';

    ctx.font = '800 24px "Inter", sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText(price, w / 2, h - 145);

    ctx.font = '600 14px "Inter", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(tag, w / 2, h - 115);

    // Concierge Bottom Bar
    const contact = luxeContact.value || 'VIP Inquiries: concierge@example.com';
    ctx.font = '400 16px "Inter", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(contact, w / 2, h - 75);
  }

  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPlayLuxe.textContent = 'Playing...';
    btnPlayLuxe.disabled = true;

    playLuxuryAudio();

    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);

      luxeProgress.value = progress * 100;
      luxeTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPlayLuxe.textContent = 'Play Commercial';
        btnPlayLuxe.disabled = false;
      }
    }, 1000 / fps);
  }

  luxeCards.forEach(card => {
    card.addEventListener('click', () => {
      luxeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentAsset = card.dataset.asset;

      const cfg = ASSET_CONFIGS[currentAsset];
      if (cfg) {
        luxeBrand.value = cfg.brand;
        luxeSlogan.value = cfg.slogan;
        luxeAttributes.value = cfg.attributes;
        luxePrice.value = cfg.price;
        luxeTag.value = cfg.tag;
      }
      renderFrame(0.5);
    });
  });

  [luxeBrand, luxeSlogan, luxeAttributes, luxePrice, luxeTag, luxeContact].forEach(el => {
    el.addEventListener('input', () => renderFrame(0.5));
  });

  btnPlayLuxe.addEventListener('click', playPreview);

  luxeProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPlayLuxe.textContent = 'Play Commercial';
      btnPlayLuxe.disabled = false;
    }
    const progress = e.target.value / 100;
    luxeTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;
    renderFrame(progress);
  });

  // Export Luxury Video
  btnExportLuxe.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportLuxe.disabled = true;
    exportMsg.style.display = 'block';

    initAudio();
    const stream = canvas.captureStream(30);

    const audioDest = audioCtx.createMediaStreamDestination();
    playLuxuryAudio(audioDest);
    audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `luxury_commercial_${currentAsset}.webm`;
      a.click();

      exportMsg.style.display = 'none';
      btnExportLuxe.disabled = false;
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
      luxeProgress.value = progress * 100;
      luxeTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  renderFrame(0.5);
});