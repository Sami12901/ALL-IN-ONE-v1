// Hotel Showcase Video Generator - Client-Side Production Logic
// Uses HTML5 Canvas + Web Audio API + MediaRecorder for zero-dependency video rendering

class HotelShowcaseStudio {
  constructor() {
    this.aspect = '16-9';
    this.width = 1280;
    this.height = 720;
    this.slideDuration = 3.5;
    this.transition = 'kenburns';
    this.audioTheme = 'ambient-piano';
    this.isPlaying = false;
    this.isRecording = false;
    this.currentTime = 0;
    this.totalDuration = 14;
    this.lastFrameTime = 0;
    this.animId = null;

    // Hotel details
    this.hotelName = 'The Grand Azure Palace & Resort';
    this.location = 'Amalfi Coast, Italy';
    this.stars = 5;
    this.tagline = 'Book Your Unforgettable Escape • From $480/Night';

    // Scenes list
    this.scenes = [
      {
        id: 1,
        title: 'Grand Atrium & Royal Lobby',
        subtitle: 'Hand-carved Italian marble & crystal chandeliers',
        theme: 'lobby',
        image: null
      },
      {
        id: 2,
        title: 'Cliffside Infinity Pool',
        subtitle: 'Unobstructed Mediterranean sunset vistas',
        theme: 'pool',
        image: null
      },
      {
        id: 3,
        title: 'Presidential Penthouse Suite',
        subtitle: 'Private panoramic terrace & personal butler',
        theme: 'suite',
        image: null
      },
      {
        id: 4,
        title: 'Michelin Star Dining & Cellar',
        subtitle: 'Artisanal culinary mastery by world chefs',
        theme: 'dining',
        image: null
      }
    ];

    // Canvas & Audio
    this.canvas = document.getElementById('preview-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.audioCtx = null;
    this.audioDest = null;
    this.particles = [];
    this.initParticles();
    this.pregenerateSceneImages();
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.6 - 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI
      });
    }
  }

  pregenerateSceneImages() {
    this.scenes.forEach(scene => {
      if (!scene.image) {
        scene.image = this.createProceduralScene(scene.theme);
      }
    });
  }

  createProceduralScene(theme) {
    const off = document.createElement('canvas');
    off.width = 1280;
    off.height = 720;
    const ctx = off.getContext('2d');

    if (theme === 'lobby') {
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      grad.addColorStop(0, '#0a0d14');
      grad.addColorStop(0.5, '#1e1b18');
      grad.addColorStop(1, '#0b0c10');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Pillars
      ctx.fillStyle = '#2a241e';
      ctx.fillRect(150, 100, 70, 620);
      ctx.fillRect(1060, 100, 70, 620);
      ctx.fillRect(320, 160, 50, 560);
      ctx.fillRect(910, 160, 50, 560);

      // Chandelier glow
      const cGlow = ctx.createRadialGradient(640, 160, 10, 640, 160, 380);
      cGlow.addColorStop(0, 'rgba(255, 220, 130, 0.9)');
      cGlow.addColorStop(0.3, 'rgba(212, 175, 55, 0.4)');
      cGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cGlow;
      ctx.beginPath();
      ctx.arc(640, 160, 380, 0, Math.PI * 2);
      ctx.fill();

      // Floor reflection
      const fGrad = ctx.createLinearGradient(0, 500, 0, 720);
      fGrad.addColorStop(0, 'rgba(212, 175, 55, 0.2)');
      fGrad.addColorStop(1, 'rgba(10, 12, 16, 0.95)');
      ctx.fillStyle = fGrad;
      ctx.fillRect(0, 500, 1280, 220);
    } else if (theme === 'pool') {
      const grad = ctx.createLinearGradient(0, 0, 0, 720);
      grad.addColorStop(0, '#fd5e53');
      grad.addColorStop(0.35, '#ff9966');
      grad.addColorStop(0.55, '#ffe57f');
      grad.addColorStop(0.65, '#005c97');
      grad.addColorStop(1, '#001a33');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Sun
      const sunGrad = ctx.createRadialGradient(640, 380, 5, 640, 380, 120);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.5, '#ffe57f');
      sunGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(640, 380, 120, 0, Math.PI * 2);
      ctx.fill();

      // Pool edge reflection lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      for (let y = 460; y < 720; y += 30) {
        ctx.beginPath();
        ctx.moveTo(100, y);
        ctx.bezierCurveTo(400, y - 8, 800, y + 8, 1180, y);
        ctx.stroke();
      }
    } else if (theme === 'suite') {
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, '#11141c');
      grad.addColorStop(0.5, '#1e2430');
      grad.addColorStop(1, '#0c0e14');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Penthouse panoramic window frames
      ctx.fillStyle = '#06070a';
      ctx.fillRect(0, 0, 1280, 50);
      ctx.fillRect(0, 640, 1280, 80);
      ctx.fillRect(400, 0, 20, 640);
      ctx.fillRect(860, 0, 20, 640);

      // Outside luxury city / sea twilight
      const skyGrad = ctx.createLinearGradient(0, 50, 0, 640);
      skyGrad.addColorStop(0, '#101728');
      skyGrad.addColorStop(0.7, '#243b55');
      skyGrad.addColorStop(1, '#ff9068');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(20, 50, 380, 590);
      ctx.fillRect(420, 50, 440, 590);
      ctx.fillRect(880, 50, 380, 590);

      // Bed silhouette & warm bedside lamps
      const lamp1 = ctx.createRadialGradient(280, 450, 5, 280, 450, 160);
      lamp1.addColorStop(0, 'rgba(255, 215, 120, 0.85)');
      lamp1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lamp1;
      ctx.beginPath();
      ctx.arc(280, 450, 160, 0, Math.PI * 2);
      ctx.fill();

      const lamp2 = ctx.createRadialGradient(1000, 450, 5, 1000, 450, 160);
      lamp2.addColorStop(0, 'rgba(255, 215, 120, 0.85)');
      lamp2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lamp2;
      ctx.beginPath();
      ctx.arc(1000, 450, 160, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Michelin dining
      const grad = ctx.createRadialGradient(640, 360, 30, 640, 360, 680);
      grad.addColorStop(0, '#2d1b18');
      grad.addColorStop(0.6, '#150f11');
      grad.addColorStop(1, '#080507');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Candle warm glow
      const candle = ctx.createRadialGradient(640, 420, 5, 640, 420, 220);
      candle.addColorStop(0, 'rgba(255, 190, 80, 0.95)');
      candle.addColorStop(0.4, 'rgba(212, 100, 30, 0.4)');
      candle.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = candle;
      ctx.beginPath();
      ctx.arc(640, 420, 220, 0, Math.PI * 2);
      ctx.fill();

      // Wine glasses silhouette
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(580, 380, 25, 0, Math.PI);
      ctx.fill();
      ctx.fillRect(578, 380, 4, 60);
      ctx.fillRect(560, 440, 40, 5);

      ctx.beginPath();
      ctx.arc(700, 370, 28, 0, Math.PI);
      ctx.fill();
      ctx.fillRect(698, 370, 4, 70);
      ctx.fillRect(680, 440, 40, 5);
    }

    const img = new Image();
    img.src = off.toDataURL('image/jpeg', 0.9);
    return img;
  }

  updateTotalDuration() {
    this.totalDuration = Math.max(1, this.scenes.length * this.slideDuration);
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
    } else {
      this.width = 900;
      this.height = 900;
    }
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.initParticles();
    this.drawFrame(this.currentTime);
  }

  initAudio() {
    if (this.audioCtx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.audioDest = this.audioCtx.createMediaStreamDestination();
    } catch (e) {
      console.warn('AudioContext not supported:', e);
    }
  }

  playAudioChord(timeOffset) {
    if (!this.audioCtx || this.audioTheme === 'silent') return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    // Ambient chords (Amaj9, F#m9, Dmaj7, E6)
    const chords = [
      [220, 277.18, 329.63, 415.30, 440], // A maj7/9
      [185, 220, 277.18, 329.63, 370],    // F# m
      [146.83, 220, 277.18, 369.99, 440], // D maj7
      [164.81, 246.94, 329.63, 392.00, 493.88] // E add9
    ];

    const currentSceneIndex = Math.floor(timeOffset / this.slideDuration) % chords.length;
    const notes = chords[currentSceneIndex];

    const now = this.audioCtx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = this.audioTheme === 'ambient-piano' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06 / notes.length, now + 0.3 + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + this.slideDuration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      if (this.audioDest) {
        gain.connect(this.audioDest);
      }

      osc.start(now + idx * 0.08);
      osc.stop(now + this.slideDuration + 0.5);
    });
  }

  drawFrame(time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#08090c';
    ctx.fillRect(0, 0, w, h);

    if (this.scenes.length === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Please add at least one scene', w / 2, h / 2);
      return;
    }

    const sceneDuration = this.slideDuration;
    const sceneIndex = Math.min(Math.floor(time / sceneDuration), this.scenes.length - 1);
    const sceneTime = time - (sceneIndex * sceneDuration);
    const progress = Math.min(sceneTime / sceneDuration, 1.0);

    const currentScene = this.scenes[sceneIndex];
    const nextScene = this.scenes[(sceneIndex + 1) % this.scenes.length];

    // Transition blending
    const transitionTime = 0.8;
    const isTransitioning = sceneTime > (sceneDuration - transitionTime) && this.scenes.length > 1;
    const transProgress = isTransitioning ? (sceneTime - (sceneDuration - transitionTime)) / transitionTime : 0;

    // Draw Current Scene Image with Ken Burns effect
    ctx.save();
    let scale = 1.0;
    let panX = 0;
    let panY = 0;

    if (this.transition === 'kenburns') {
      scale = 1.0 + (progress * 0.08);
      panX = Math.sin(progress * Math.PI) * 20;
      panY = Math.cos(progress * Math.PI) * 10;
    } else if (this.transition === 'zoom-in') {
      scale = 1.0 + (progress * 0.15);
    }

    ctx.translate(w / 2 + panX, h / 2 + panY);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    if (currentScene.image && currentScene.image.complete) {
      ctx.drawImage(currentScene.image, 0, 0, w, h);
    }
    ctx.restore();

    // Transition overlay
    if (isTransitioning) {
      ctx.save();
      if (this.transition === 'fade') {
        ctx.globalAlpha = transProgress;
        if (nextScene.image && nextScene.image.complete) {
          ctx.drawImage(nextScene.image, 0, 0, w, h);
        }
      } else if (this.transition === 'golden-wipe') {
        const wipeX = w * transProgress;
        ctx.fillStyle = '#c5a059';
        ctx.shadowColor = '#c5a059';
        ctx.shadowBlur = 40;
        ctx.fillRect(wipeX - 10, 0, 20, h);
      }
      ctx.restore();
    }

    // Atmospheric Vignette & Dark Gradient for text readability
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,0.4)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating Gold Dust Particles
    ctx.save();
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += 0.04;
      if (p.y < 0) p.y = h;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;

      const alpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
      ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Top Brand Header
    ctx.save();
    ctx.textAlign = 'center';
    
    // Star Rating
    let starString = '';
    for (let s = 0; s < this.stars; s++) starString += '★ ';
    ctx.font = '700 16px sans-serif';
    ctx.fillStyle = '#c5a059';
    ctx.shadowColor = 'rgba(197, 160, 89, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText(starString.trim(), w / 2, 60);

    // Hotel Name
    ctx.font = '800 28px "Cinzel", "Playfair Display", serif, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.letterSpacing = '2px';
    ctx.fillText(this.hotelName.toUpperCase(), w / 2, 95);

    // Location Badge
    ctx.font = '500 14px sans-serif';
    ctx.fillStyle = '#d0d4de';
    ctx.shadowBlur = 4;
    ctx.fillText(`📍 ${this.location}`, w / 2, 122);
    ctx.restore();

    // Scene Specific Title & Subtitle (Animated Fade & Rise)
    ctx.save();
    const textProgress = Math.min(sceneTime * 1.5, 1.0);
    const textAlpha = textProgress;
    const textYOffset = (1 - textProgress) * 20;

    ctx.globalAlpha = textAlpha;
    ctx.textAlign = 'center';

    // Scene Index Pill
    const pillY = h - 210 + textYOffset;
    ctx.fillStyle = 'rgba(197, 160, 89, 0.25)';
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 1;
    const pillText = `SCENE 0${sceneIndex + 1} / 0${this.scenes.length}`;
    ctx.font = '600 12px sans-serif';
    const pillW = ctx.measureText(pillText).width + 24;
    ctx.beginPath();
    ctx.roundRect(w / 2 - pillW / 2, pillY - 14, pillW, 22, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e8caa4';
    ctx.fillText(pillText, w / 2, pillY);

    // Scene Main Title
    ctx.font = '700 36px "Cinzel", "Playfair Display", serif, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 15;
    ctx.fillText(currentScene.title, w / 2, h - 150 + textYOffset);

    // Scene Subtitle
    ctx.font = '400 16px sans-serif';
    ctx.fillStyle = '#c2c8d6';
    ctx.fillText(currentScene.subtitle, w / 2, h - 115 + textYOffset);

    // Tagline / CTA Bar at bottom
    ctx.font = '600 13px sans-serif';
    ctx.fillStyle = '#c5a059';
    ctx.fillText(this.tagline, w / 2, h - 45);

    // Golden frame border line
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.restore();
  }

  play() {
    this.initAudio();
    this.isPlaying = true;
    document.getElementById('btn-play-pause').innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      Pause Preview
    `;
    this.lastFrameTime = performance.now();
    this.playAudioChord(this.currentTime);
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
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  restart() {
    this.currentTime = 0;
    this.drawFrame(0);
    this.updateProgressUI();
    if (this.isPlaying) {
      this.playAudioChord(0);
    }
  }

  loop() {
    if (!this.isPlaying) return;
    const now = performance.now();
    const delta = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    const prevSceneIndex = Math.floor(this.currentTime / this.slideDuration);
    this.currentTime += delta;
    const newSceneIndex = Math.floor(this.currentTime / this.slideDuration);

    if (newSceneIndex !== prevSceneIndex && this.currentTime < this.totalDuration) {
      this.playAudioChord(this.currentTime);
    }

    if (this.currentTime >= this.totalDuration) {
      this.currentTime = 0;
      this.playAudioChord(0);
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

      // Add synthetic audio track if available and enabled
      if (this.audioDest && this.audioTheme !== 'silent' && this.audioDest.stream.getAudioTracks().length > 0) {
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
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const sanitized = this.hotelName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        a.download = `${sanitized}-showcase.webm`;
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
          statusText.textContent = 'Finalizing luxury video file...';
          recorder.stop();
          return;
        }

        const t = frame * frameStep;
        if (frame % Math.floor(this.slideDuration * 30) === 0) {
          this.playAudioChord(t);
        }

        this.drawFrame(t);
        frame++;

        const percent = Math.round((frame / totalFrames) * 100);
        progressBar.style.width = `${percent}%`;
        statusText.textContent = `Rendering frame ${frame} of ${totalFrames} (${percent}%)...`;

        setTimeout(renderNext, 16);
      };

      renderNext();

    } catch (err) {
      console.error('Export failed:', err);
      alert('Video export error: ' + err.message);
      modal.classList.remove('active');
    }
  }

  renderScenesList() {
    const container = document.getElementById('scenes-container');
    container.innerHTML = '';
    document.getElementById('scene-count').textContent = this.scenes.length;

    this.scenes.forEach((scene, index) => {
      const card = document.createElement('div');
      card.className = 'scene-card';
      card.innerHTML = `
        <div class="scene-card-header">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--accent);">Scene 0${index + 1}</span>
          <button type="button" class="btn btn-sm btn-delete-scene" data-id="${scene.id}" style="color: #ff5555; background: none; border: none; cursor: pointer; padding: 2px;">✕</button>
        </div>
        <img class="scene-thumb-preview" id="thumb-${scene.id}" src="${scene.image ? scene.image.src : ''}" alt="${scene.title}">
        <div class="form-group" style="margin-bottom: 0.5rem;">
          <input type="text" class="form-input scene-title-input" data-id="${scene.id}" value="${scene.title}" placeholder="Scene Title" style="font-size: 0.85rem; padding: 0.4rem 0.6rem;">
        </div>
        <div class="form-group">
          <input type="text" class="form-input scene-subtitle-input" data-id="${scene.id}" value="${scene.subtitle}" placeholder="Subtitle description" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;">
        </div>
      `;
      container.appendChild(card);
    });

    // Hook inputs
    container.querySelectorAll('.scene-title-input').forEach(inp => {
      inp.addEventListener('input', e => {
        const id = parseInt(e.target.dataset.id, 10);
        const s = this.scenes.find(x => x.id === id);
        if (s) {
          s.title = e.target.value;
          this.drawFrame(this.currentTime);
        }
      });
    });

    container.querySelectorAll('.scene-subtitle-input').forEach(inp => {
      inp.addEventListener('input', e => {
        const id = parseInt(e.target.dataset.id, 10);
        const s = this.scenes.find(x => x.id === id);
        if (s) {
          s.subtitle = e.target.value;
          this.drawFrame(this.currentTime);
        }
      });
    });

    container.querySelectorAll('.btn-delete-scene').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = parseInt(e.target.dataset.id, 10);
        if (this.scenes.length <= 1) {
          alert('Showcase requires at least 1 scene.');
          return;
        }
        this.scenes = this.scenes.filter(x => x.id !== id);
        this.updateTotalDuration();
        this.renderScenesList();
        this.drawFrame(0);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const studio = new HotelShowcaseStudio();
  studio.updateTotalDuration();
  studio.renderScenesList();
  studio.drawFrame(0);

  // Form bindings
  document.getElementById('hotel-name').addEventListener('input', e => {
    studio.hotelName = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('hotel-location').addEventListener('input', e => {
    studio.location = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('hotel-stars').addEventListener('change', e => {
    studio.stars = parseInt(e.target.value, 10);
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('hotel-tagline').addEventListener('input', e => {
    studio.tagline = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('transition-style').addEventListener('change', e => {
    studio.transition = e.target.value;
  });

  document.getElementById('audio-theme').addEventListener('change', e => {
    studio.audioTheme = e.target.value;
  });

  const durationSlider = document.getElementById('slide-duration');
  durationSlider.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    studio.slideDuration = val;
    studio.updateTotalDuration();
    document.getElementById('slide-duration-label').textContent = `${val} seconds`;
    studio.updateProgressUI();
  });

  // Aspect ratio chips
  document.querySelectorAll('#aspect-selector .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#aspect-selector .chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      studio.setAspect(btn.dataset.aspect);
    });
  });

  // Player controls
  document.getElementById('btn-play-pause').addEventListener('click', () => studio.togglePlay());
  document.getElementById('btn-restart').addEventListener('click', () => studio.restart());
  document.getElementById('btn-export-video').addEventListener('click', () => studio.exportVideo());

  // Add scene
  document.getElementById('btn-add-scene').addEventListener('click', () => {
    const newId = Date.now();
    const newScene = {
      id: newId,
      title: 'Exclusive Oasis Villa',
      subtitle: 'Secluded luxury with private infinity pool and spa',
      theme: 'pool',
      image: studio.createProceduralScene('pool')
    };
    studio.scenes.push(newScene);
    studio.updateTotalDuration();
    studio.renderScenesList();
    studio.drawFrame(studio.currentTime);
  });

  // Custom photo upload
  document.getElementById('upload-scene-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const img = new Image();
      img.onload = () => {
        const newId = Date.now();
        studio.scenes.push({
          id: newId,
          title: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
          subtitle: 'Guest Haven & Serenity',
          theme: 'custom',
          image: img
        });
        studio.updateTotalDuration();
        studio.renderScenesList();
        studio.drawFrame(studio.currentTime);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });
});