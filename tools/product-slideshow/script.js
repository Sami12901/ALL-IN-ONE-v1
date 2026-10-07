// Product Slideshow Video Engine
// Client-side canvas synthesis + Web Audio + MediaRecorder

class ProductSlideshowStudio {
  constructor() {
    this.aspect = '16-9';
    this.width = 1280;
    this.height = 720;
    this.slideDuration = 3.0;
    this.transitionEffect = 'kenburns';
    this.watermark = 'LUMIÈRE ATELIER';
    this.audioTrack = 'ambient-chill';

    this.isPlaying = false;
    this.currentTime = 0;
    this.totalDuration = 12.0;
    this.lastTime = 0;
    this.animId = null;

    this.canvas = document.getElementById('preview-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.audioCtx = null;
    this.audioDest = null;

    this.slides = [
      {
        id: 1,
        title: 'Solitaire Diamond Ring',
        price: '$3,200',
        badge: '18K White Gold',
        theme: 'ring',
        img: null
      },
      {
        id: 2,
        title: 'Artisanal Italian Leather Tote',
        price: '$890',
        badge: 'Handcrafted',
        theme: 'bag',
        img: null
      },
      {
        id: 3,
        title: 'Classic Rangefinder Camera',
        price: '$1,450',
        badge: 'Limited Run',
        theme: 'camera',
        img: null
      },
      {
        id: 4,
        title: 'Emerald Cut Pendant',
        price: '$2,100',
        badge: 'Natural Gem',
        theme: 'emerald',
        img: null
      }
    ];

    this.generateSampleImages();
    this.updateTotalDuration();
  }

  generateSampleImages() {
    this.slides.forEach(s => {
      if (!s.img) s.img = this.createSlideGraphic(s.theme);
    });
  }

  createSlideGraphic(theme) {
    const off = document.createElement('canvas');
    off.width = 1280;
    off.height = 720;
    const c = off.getContext('2d');

    const grad = c.createRadialGradient(640, 360, 50, 640, 360, 700);
    if (theme === 'ring') {
      grad.addColorStop(0, '#1c1b24');
      grad.addColorStop(1, '#09080c');
      c.fillStyle = grad;
      c.fillRect(0, 0, 1280, 720);

      // Ring band
      c.strokeStyle = '#e0e4ed';
      c.lineWidth = 18;
      c.beginPath();
      c.ellipse(640, 380, 130, 80, 0, 0, Math.PI * 2);
      c.stroke();

      // Gemstone
      c.fillStyle = '#bdf4ff';
      c.beginPath();
      c.moveTo(640, 240);
      c.lineTo(680, 275);
      c.lineTo(660, 320);
      c.lineTo(620, 320);
      c.lineTo(600, 275);
      c.closePath();
      c.fill();
      c.strokeStyle = '#ffffff';
      c.lineWidth = 3;
      c.stroke();

      // Sparkles
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(630, 255, 6, 0, Math.PI * 2);
      c.fill();
    } else if (theme === 'bag') {
      grad.addColorStop(0, '#261b17');
      grad.addColorStop(1, '#0e0a09');
      c.fillStyle = grad;
      c.fillRect(0, 0, 1280, 720);

      // Leather Tote body
      c.fillStyle = '#a65e38';
      c.beginPath();
      c.roundRect(500, 280, 280, 240, 18);
      c.fill();
      c.strokeStyle = '#63371f';
      c.lineWidth = 6;
      c.stroke();

      // Handles
      c.strokeStyle = '#4d2915';
      c.lineWidth = 14;
      c.beginPath();
      c.arc(640, 280, 70, Math.PI, 0);
      c.stroke();
    } else if (theme === 'camera') {
      grad.addColorStop(0, '#1f242b');
      grad.addColorStop(1, '#0b0d10');
      c.fillStyle = grad;
      c.fillRect(0, 0, 1280, 720);

      // Body
      c.fillStyle = '#2c313a';
      c.fillRect(480, 260, 320, 190);
      c.fillStyle = '#d8dbe2';
      c.fillRect(480, 230, 320, 30);

      // Lens circle
      c.fillStyle = '#111317';
      c.beginPath();
      c.arc(640, 355, 75, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#00e5ff';
      c.lineWidth = 6;
      c.stroke();
    } else {
      // Emerald
      grad.addColorStop(0, '#0c221a');
      grad.addColorStop(1, '#050f0b');
      c.fillStyle = grad;
      c.fillRect(0, 0, 1280, 720);

      // Gem
      c.fillStyle = '#00e676';
      c.beginPath();
      c.roundRect(570, 260, 140, 190, 14);
      c.fill();
      c.strokeStyle = '#b9f6ca';
      c.lineWidth = 4;
      c.stroke();

      // Gold Chain
      c.strokeStyle = '#c5a059';
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(640, 260);
      c.bezierCurveTo(620, 140, 660, 100, 640, 80);
      c.stroke();
    }

    const img = new Image();
    img.src = off.toDataURL('image/jpeg', 0.9);
    return img;
  }

  updateTotalDuration() {
    this.totalDuration = Math.max(1, this.slides.length * this.slideDuration);
  }

  setAspect(ratioKey) {
    this.aspect = ratioKey;
    const wrapper = document.getElementById('preview-wrapper');
    wrapper.className = `canvas-preview-container aspect-${ratioKey}`;

    if (ratioKey === '16-9') {
      this.width = 1280;
      this.height = 720;
    } else if (ratioKey === '9-16') {
      this.width = 720;
      this.height = 1280;
    } else if (ratioKey === '1-1') {
      this.width = 900;
      this.height = 900;
    } else {
      this.width = 720;
      this.height = 900;
    }
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.drawFrame(this.currentTime);
  }

  initAudio() {
    if (this.audioCtx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.audioDest = this.audioCtx.createMediaStreamDestination();
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
  }

  playAudioNote(slideIdx) {
    if (!this.audioCtx || this.audioTrack === 'none') return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const now = this.audioCtx.currentTime;
    const notes = [
      [261.63, 329.63, 392.00, 523.25], // C major
      [220.00, 261.63, 329.63, 440.00], // A minor
      [174.61, 220.00, 261.63, 349.23], // F major
      [196.00, 246.94, 293.66, 392.00]  // G major
    ];

    const chord = notes[slideIdx % notes.length];
    chord.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = this.audioTrack === 'ambient-chill' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.1 + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + this.slideDuration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      if (this.audioDest) gain.connect(this.audioDest);

      osc.start(now + idx * 0.05);
      osc.stop(now + this.slideDuration + 0.5);
    });
  }

  drawFrame(t) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, w, h);

    if (this.slides.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No slides in presentation', w / 2, h / 2);
      return;
    }

    const sDur = this.slideDuration;
    const currentIdx = Math.min(Math.floor(t / sDur), this.slides.length - 1);
    const localTime = t - (currentIdx * sDur);
    const progress = Math.min(localTime / sDur, 1.0);

    const curSlide = this.slides[currentIdx];
    const nextIdx = (currentIdx + 1) % this.slides.length;
    const nextSlide = this.slides[nextIdx];

    const transitionDur = 0.7;
    const isTransition = localTime > (sDur - transitionDur) && this.slides.length > 1;
    const transProg = isTransition ? (localTime - (sDur - transitionDur)) / transitionDur : 0;

    // Draw Slide
    ctx.save();
    let scale = 1.0;
    let panX = 0;

    if (this.transitionEffect === 'kenburns') {
      scale = 1.0 + (progress * 0.1);
      panX = (progress - 0.5) * 30;
    }

    ctx.translate(w / 2 + panX, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    if (curSlide.img && curSlide.img.complete) {
      ctx.drawImage(curSlide.img, 0, 0, w, h);
    }
    ctx.restore();

    // Transition effect
    if (isTransition) {
      ctx.save();
      if (this.transitionEffect === 'crossfade') {
        ctx.globalAlpha = transProg;
        if (nextSlide.img && nextSlide.img.complete) {
          ctx.drawImage(nextSlide.img, 0, 0, w, h);
        }
      } else if (this.transitionEffect === 'slide-left') {
        const offset = w * (1 - transProg);
        if (nextSlide.img && nextSlide.img.complete) {
          ctx.drawImage(nextSlide.img, offset, 0, w, h);
        }
      } else if (this.transitionEffect === 'zoom-flash') {
        const flashAlpha = Math.sin(transProg * Math.PI) * 0.8;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, w, h);
        if (transProg > 0.5 && nextSlide.img && nextSlide.img.complete) {
          ctx.drawImage(nextSlide.img, 0, 0, w, h);
        }
      }
      ctx.restore();
    }

    // Vignette & bottom overlay gradient
    const vig = ctx.createLinearGradient(0, 0, 0, h);
    vig.addColorStop(0, 'rgba(0,0,0,0.3)');
    vig.addColorStop(0.65, 'rgba(0,0,0,0.1)');
    vig.addColorStop(1, 'rgba(0,0,0,0.88)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Watermark Top Left
    ctx.font = '700 13px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'left';
    ctx.fillText(this.watermark.toUpperCase(), 30, 42);

    // Slide Counter Top Right
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(197, 160, 89, 0.9)';
    ctx.fillText(`${currentIdx + 1} / ${this.slides.length}`, w - 30, 42);

    // Bottom Caption Box
    ctx.save();
    const textAlpha = Math.min(localTime * 2, 1.0);
    ctx.globalAlpha = textAlpha;

    // Badge
    ctx.fillStyle = 'rgba(197, 160, 89, 0.25)';
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(30, h - 130, 140, 24, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 11px sans-serif';
    ctx.fillStyle = '#e8caa4';
    ctx.textAlign = 'center';
    ctx.fillText(curSlide.badge.toUpperCase(), 100, h - 114);

    // Title
    ctx.textAlign = 'left';
    ctx.font = '700 32px "Cinzel", "Playfair Display", serif, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText(curSlide.title, 30, h - 70);

    // Price
    ctx.font = '800 24px sans-serif';
    ctx.fillStyle = '#c5a059';
    ctx.fillText(curSlide.price, 30, h - 35);

    ctx.restore();

    // Timeline tick line at the very bottom
    const tickWidth = w * (t / this.totalDuration);
    ctx.fillStyle = '#c5a059';
    ctx.fillRect(0, h - 4, tickWidth, 4);
  }

  play() {
    this.initAudio();
    this.isPlaying = true;
    document.getElementById('btn-play-pause').innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      Pause Preview
    `;
    this.lastTime = performance.now();
    this.playAudioNote(Math.floor(this.currentTime / this.slideDuration));
    this.loop();
  }

  pause() {
    this.isPlaying = false;
    document.getElementById('btn-play-pause').innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      Play Preview
    `;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  restart() {
    this.currentTime = 0;
    this.drawFrame(0);
    this.updateProgressUI();
    if (this.isPlaying) this.playAudioNote(0);
  }

  loop() {
    if (!this.isPlaying) return;
    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    const prevIdx = Math.floor(this.currentTime / this.slideDuration);
    this.currentTime += delta;
    const curIdx = Math.floor(this.currentTime / this.slideDuration);

    if (curIdx !== prevIdx && this.currentTime < this.totalDuration) {
      this.playAudioNote(curIdx);
    }

    if (this.currentTime >= this.totalDuration) {
      this.currentTime = 0;
      this.playAudioNote(0);
    }

    this.drawFrame(this.currentTime);
    this.updateProgressUI();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  updateProgressUI() {
    const prog = (this.currentTime / this.totalDuration) * 100;
    document.getElementById('playback-progress').style.width = `${Math.min(prog, 100)}%`;

    const curM = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
    const curS = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
    const totM = Math.floor(this.totalDuration / 60).toString().padStart(2, '0');
    const totS = Math.floor(this.totalDuration % 60).toString().padStart(2, '0');
    document.getElementById('time-display').textContent = `${curM}:${curS} / ${totM}:${totS}`;
  }

  async exportVideo() {
    this.pause();
    this.initAudio();

    const modal = document.getElementById('export-modal');
    const progressBar = document.getElementById('export-progress-bar');
    const statusText = document.getElementById('export-status-text');
    modal.classList.add('active');

    try {
      const stream = this.canvas.captureStream(30);

      if (this.audioDest && this.audioTrack !== 'none' && this.audioDest.stream.getAudioTracks().length > 0) {
        stream.addTrack(this.audioDest.stream.getAudioTracks()[0]);
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4500000
      });

      const chunks = [];
      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `product-slideshow.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        modal.classList.remove('active');
      };

      recorder.start();

      const totalFrames = Math.floor(this.totalDuration * 30);
      let frame = 0;
      const frameStep = 1 / 30;

      const renderNext = () => {
        if (frame >= totalFrames) {
          statusText.textContent = 'Saving slideshow video...';
          recorder.stop();
          return;
        }

        const t = frame * frameStep;
        if (frame % Math.floor(this.slideDuration * 30) === 0) {
          this.playAudioNote(Math.floor(t / this.slideDuration));
        }

        this.drawFrame(t);
        frame++;

        const percent = Math.round((frame / totalFrames) * 100);
        progressBar.style.width = `${percent}%`;
        statusText.textContent = `Processing frame ${frame} of ${totalFrames} (${percent}%)...`;

        setTimeout(renderNext, 16);
      };

      renderNext();

    } catch (err) {
      console.error('Export error:', err);
      alert('Slideshow export failed: ' + err.message);
      modal.classList.remove('active');
    }
  }

  renderSlidesList() {
    const cont = document.getElementById('slides-list-container');
    cont.innerHTML = '';
    document.getElementById('slide-count-badge').textContent = this.slides.length;

    this.slides.forEach((slide, idx) => {
      const card = document.createElement('div');
      card.className = 'slide-item-card';
      card.innerHTML = `
        <img class="slide-item-thumb" src="${slide.img ? slide.img.src : ''}" alt="${slide.title}">
        <div style="flex: 1;">
          <input type="text" class="form-input slide-title-inp" data-id="${slide.id}" value="${slide.title}" style="padding: 0.3rem 0.5rem; font-size: 0.85rem; margin-bottom: 0.3rem;">
          <div style="display: flex; gap: 0.4rem;">
            <input type="text" class="form-input slide-price-inp" data-id="${slide.id}" value="${slide.price}" style="padding: 0.25rem 0.4rem; font-size: 0.75rem;">
            <input type="text" class="form-input slide-badge-inp" data-id="${slide.id}" value="${slide.badge}" style="padding: 0.25rem 0.4rem; font-size: 0.75rem;">
          </div>
        </div>
        <button type="button" class="btn-delete-slide" data-id="${slide.id}" style="color: #ff5555; background: none; border: none; cursor: pointer; padding: 4px;">✕</button>
      `;
      cont.appendChild(card);
    });

    cont.querySelectorAll('.slide-title-inp').forEach(inp => {
      inp.addEventListener('input', e => {
        const id = parseInt(e.target.dataset.id, 10);
        const s = this.slides.find(x => x.id === id);
        if (s) {
          s.title = e.target.value;
          this.drawFrame(this.currentTime);
        }
      });
    });

    cont.querySelectorAll('.slide-price-inp').forEach(inp => {
      inp.addEventListener('input', e => {
        const id = parseInt(e.target.dataset.id, 10);
        const s = this.slides.find(x => x.id === id);
        if (s) {
          s.price = e.target.value;
          this.drawFrame(this.currentTime);
        }
      });
    });

    cont.querySelectorAll('.slide-badge-inp').forEach(inp => {
      inp.addEventListener('input', e => {
        const id = parseInt(e.target.dataset.id, 10);
        const s = this.slides.find(x => x.id === id);
        if (s) {
          s.badge = e.target.value;
          this.drawFrame(this.currentTime);
        }
      });
    });

    cont.querySelectorAll('.btn-delete-slide').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = parseInt(e.target.dataset.id, 10);
        if (this.slides.length <= 1) {
          alert('Slideshow requires at least 1 slide.');
          return;
        }
        this.slides = this.slides.filter(x => x.id !== id);
        this.updateTotalDuration();
        this.renderSlidesList();
        this.drawFrame(0);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const studio = new ProductSlideshowStudio();
  studio.renderSlidesList();
  studio.drawFrame(0);

  // Bind settings
  document.getElementById('transition-effect').addEventListener('change', e => {
    studio.transitionEffect = e.target.value;
  });

  const speedSlider = document.getElementById('slide-speed');
  speedSlider.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    studio.slideDuration = val;
    studio.updateTotalDuration();
    document.getElementById('slide-speed-val').textContent = `${val} seconds`;
    studio.updateProgressUI();
  });

  document.getElementById('watermark-text').addEventListener('input', e => {
    studio.watermark = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('slideshow-audio').addEventListener('change', e => {
    studio.audioTrack = e.target.value;
  });

  // Aspect ratio
  document.querySelectorAll('#aspect-selector .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#aspect-selector .chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      studio.setAspect(btn.dataset.aspect);
    });
  });

  // Play controls
  document.getElementById('btn-play-pause').addEventListener('click', () => studio.togglePlay());
  document.getElementById('btn-restart').addEventListener('click', () => studio.restart());
  document.getElementById('btn-export-video').addEventListener('click', () => studio.exportVideo());

  // Add sample slide
  document.getElementById('btn-add-sample').addEventListener('click', () => {
    const themes = ['ring', 'bag', 'camera', 'emerald'];
    const chosen = themes[studio.slides.length % themes.length];
    const newSlide = {
      id: Date.now(),
      title: 'Premium Atelier Edition',
      price: '$1,950',
      badge: 'Collection Extra',
      theme: chosen,
      img: studio.createSlideGraphic(chosen)
    };
    studio.slides.push(newSlide);
    studio.updateTotalDuration();
    studio.renderSlidesList();
    studio.drawFrame(studio.currentTime);
  });

  // Upload custom photos
  document.getElementById('upload-slides-input').addEventListener('change', e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = evt => {
        const img = new Image();
        img.onload = () => {
          studio.slides.push({
            id: Date.now() + Math.random(),
            title: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
            price: 'EXCLUSIVE',
            badge: 'NEW ARRIVAL',
            theme: 'custom',
            img: img
          });
          studio.updateTotalDuration();
          studio.renderSlidesList();
          studio.drawFrame(studio.currentTime);
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  });
});