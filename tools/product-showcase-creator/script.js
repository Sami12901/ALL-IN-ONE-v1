// Product Showcase Creator Studio Logic
// Uses HTML5 Canvas + Web Audio API + MediaRecorder for instant video export

class ShowcaseStudio {
  constructor() {
    this.aspect = '16-9';
    this.width = 1280;
    this.height = 720;
    this.duration = 8.0;
    this.currentTime = 0;
    this.isPlaying = false;
    this.lastTime = 0;
    this.animId = null;

    // Controls
    this.model = 'perfume';
    this.customImage = null;
    this.pedestal = 'obsidian';
    this.spotlight = 'amber';
    this.particlesType = 'sparks';
    this.motionType = 'orbit';

    // Branding
    this.brandTitle = 'LUMIÈRE COUTURE';
    this.headline = 'Élixir Imperial • Extrait de Parfum';
    this.priceBadge = '$420 • 100ml';

    this.canvas = document.getElementById('preview-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.audioCtx = null;
    this.audioDest = null;

    this.modelImages = {};
    this.particles = [];
    this.initParticles();
    this.initModelGraphics();
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.8 - 0.2,
        alpha: Math.random() * 0.7 + 0.2,
        pulse: Math.random() * Math.PI
      });
    }
  }

  initModelGraphics() {
    ['perfume', 'watch', 'earbuds', 'sneaker'].forEach(m => {
      this.modelImages[m] = this.renderProceduralModel(m);
    });
  }

  renderProceduralModel(m) {
    const off = document.createElement('canvas');
    off.width = 500;
    off.height = 500;
    const c = off.getContext('2d');
    const cx = 250;
    const cy = 250;

    if (m === 'perfume') {
      // Golden luxury flacon
      const glass = c.createLinearGradient(cx - 90, cy, cx + 90, cy);
      glass.addColorStop(0, 'rgba(255, 220, 150, 0.5)');
      glass.addColorStop(0.5, 'rgba(255, 215, 120, 0.95)');
      glass.addColorStop(1, 'rgba(212, 160, 60, 0.5)');
      c.fillStyle = glass;
      c.beginPath();
      c.roundRect(cx - 90, cy - 60, 180, 230, 20);
      c.fill();
      c.strokeStyle = '#ffffff';
      c.lineWidth = 4;
      c.stroke();

      // Gold cap
      c.fillStyle = '#c5a059';
      c.fillRect(cx - 45, cy - 140, 90, 70);
      c.strokeStyle = '#ffe29e';
      c.lineWidth = 3;
      c.strokeRect(cx - 45, cy - 140, 90, 70);

      // Emblem
      c.fillStyle = '#111';
      c.font = '700 20px serif';
      c.textAlign = 'center';
      c.fillText('LUMIÈRE', cx, cy + 40);
    } else if (m === 'watch') {
      // Dial
      c.fillStyle = '#0e1117';
      c.beginPath();
      c.arc(cx, cy, 140, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#c5a059';
      c.lineWidth = 14;
      c.stroke();

      // Hands
      c.strokeStyle = '#ffd27d';
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + 50, cy - 60);
      c.stroke();
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx - 70, cy + 20);
      c.stroke();
    } else if (m === 'earbuds') {
      // Wireless charging case
      c.fillStyle = '#1c1f26';
      c.beginPath();
      c.roundRect(cx - 100, cy - 70, 200, 150, 36);
      c.fill();
      c.strokeStyle = '#363d4d';
      c.lineWidth = 6;
      c.stroke();

      // LED indicator
      c.fillStyle = '#00ffcc';
      c.beginPath();
      c.arc(cx, cy + 20, 5, 0, Math.PI * 2);
      c.fill();
    } else {
      // Sneaker
      c.fillStyle = '#e8eaed';
      c.beginPath();
      c.ellipse(cx, cy + 60, 160, 35, 0, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#202124';
      c.beginPath();
      c.moveTo(cx - 150, cy + 40);
      c.quadraticCurveTo(cx - 120, cy - 40, cx - 40, cy - 50);
      c.quadraticCurveTo(cx + 40, cy - 80, cx + 90, cy - 40);
      c.quadraticCurveTo(cx + 120, cy + 10, cx + 150, cy + 40);
      c.closePath();
      c.fill();

      c.strokeStyle = '#00e5ff';
      c.lineWidth = 8;
      c.beginPath();
      c.moveTo(cx - 70, cy);
      c.quadraticCurveTo(cx, cy + 30, cx + 80, cy - 10);
      c.stroke();
    }

    const img = new Image();
    img.src = off.toDataURL('image/png');
    return img;
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
      console.warn('AudioContext failed:', e);
    }
  }

  playAudioDrone() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65.4, now); // C2 warm sub drone
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 1.0);
    gain.gain.linearRampToValueAtTime(0.01, now + this.duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    if (this.audioDest) gain.connect(this.audioDest);

    osc.start(now);
    osc.stop(now + this.duration);
  }

  drawFrame(t) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Deep studio background
    ctx.fillStyle = '#060709';
    ctx.fillRect(0, 0, w, h);

    // Volumetric Spotlight beam from top
    const spotX = w * 0.5;
    const spotY = 0;
    const pedCenterY = h * 0.62;

    let spotColor = 'rgba(255, 215, 120, 0.15)';
    let spotTint = '#c5a059';
    if (this.spotlight === 'cyan') {
      spotColor = 'rgba(0, 229, 255, 0.15)';
      spotTint = '#00e5ff';
    } else if (this.spotlight === 'studio') {
      spotColor = 'rgba(255, 255, 255, 0.18)';
      spotTint = '#ffffff';
    } else if (this.spotlight === 'ruby') {
      spotColor = 'rgba(255, 50, 80, 0.15)';
      spotTint = '#ff3355';
    }

    // Cone
    ctx.save();
    const beamGrad = ctx.createRadialGradient(spotX, 0, 10, spotX, pedCenterY, 500);
    beamGrad.addColorStop(0, spotColor);
    beamGrad.addColorStop(0.7, 'rgba(0,0,0,0.03)');
    beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(spotX - 80, 0);
    ctx.lineTo(spotX + 80, 0);
    ctx.lineTo(spotX + 320, pedCenterY + 40);
    ctx.lineTo(spotX - 320, pedCenterY + 40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Pedestal Dimensions
    const pedWidth = Math.min(w * 0.45, 420);
    const pedHeight = 70;
    const pedX = spotX;
    const pedY = pedCenterY;

    // Pedestal Bottom Base & Sides
    ctx.save();
    if (this.pedestal === 'obsidian') {
      // Black marble side
      ctx.fillStyle = '#14171d';
      ctx.beginPath();
      ctx.ellipse(pedX, pedY + pedHeight, pedWidth / 2, 35, 0, 0, Math.PI);
      ctx.lineTo(pedX - pedWidth / 2, pedY);
      ctx.ellipse(pedX, pedY, pedWidth / 2, 35, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      // Top marble face
      const topGrad = ctx.createRadialGradient(pedX, pedY, 10, pedX, pedY, pedWidth / 2);
      topGrad.addColorStop(0, '#2b303c');
      topGrad.addColorStop(0.8, '#181b22');
      topGrad.addColorStop(1, '#0e1014');
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.ellipse(pedX, pedY, pedWidth / 2, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = spotTint;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (this.pedestal === 'gold') {
      ctx.fillStyle = '#7a5a1f';
      ctx.beginPath();
      ctx.ellipse(pedX, pedY + pedHeight, pedWidth / 2, 35, 0, 0, Math.PI);
      ctx.lineTo(pedX - pedWidth / 2, pedY);
      ctx.ellipse(pedX, pedY, pedWidth / 2, 35, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();

      const topGrad = ctx.createLinearGradient(pedX - pedWidth / 2, pedY, pedX + pedWidth / 2, pedY);
      topGrad.addColorStop(0, '#c5a059');
      topGrad.addColorStop(0.5, '#fff1cc');
      topGrad.addColorStop(1, '#947029');
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.ellipse(pedX, pedY, pedWidth / 2, 35, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.pedestal === 'steel') {
      ctx.fillStyle = '#22252a';
      ctx.beginPath();
      ctx.ellipse(pedX, pedY + pedHeight, pedWidth / 2, 35, 0, 0, Math.PI);
      ctx.lineTo(pedX - pedWidth / 2, pedY);
      ctx.ellipse(pedX, pedY, pedWidth / 2, 35, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();

      const topGrad = ctx.createRadialGradient(pedX, pedY, 10, pedX, pedY, pedWidth / 2);
      topGrad.addColorStop(0, '#5b6371');
      topGrad.addColorStop(1, '#2c3038');
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.ellipse(pedX, pedY, pedWidth / 2, 35, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Neon Ring
      ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.beginPath();
      ctx.ellipse(pedX, pedY, pedWidth / 2, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // Compute Product Motion: 3D Turntable Spin or Swing
    let rotAngle = 0;
    let bobY = 0;
    let scaleX = 1.0;

    if (this.motionType === 'orbit') {
      rotAngle = (t / this.duration) * Math.PI * 2;
      scaleX = Math.cos(rotAngle);
      bobY = Math.sin(t * 3) * 6;
    } else if (this.motionType === 'swing') {
      rotAngle = Math.sin((t / this.duration) * Math.PI * 2) * 0.45;
      scaleX = Math.cos(rotAngle);
      bobY = Math.abs(Math.sin(t * 2)) * -14;
    } else {
      // Reveal & Elevate
      const p = Math.min(t / 2.5, 1.0);
      bobY = (1 - p) * 60;
      scaleX = Math.cos(t * 1.5);
    }

    const currentImg = this.customImage || this.modelImages[this.model];
    const imgSize = Math.min(w, h) * 0.44;
    const prodX = spotX;
    const prodY = pedY - imgSize * 0.48 + bobY;

    // Floor Reflection (Inverted on the pedestal top)
    if (currentImg && currentImg.complete) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.translate(prodX, pedY + 8);
      ctx.scale(scaleX, -0.4); // inverted squash reflection
      ctx.drawImage(currentImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
      ctx.restore();
    }

    // Hero Product
    if (currentImg && currentImg.complete) {
      ctx.save();
      ctx.translate(prodX, prodY);
      ctx.scale(scaleX, 1.0);

      // Cast soft ambient shadow onto pedestal
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 25;
      ctx.drawImage(currentImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);

      // Specular sweep highlight pass across the object
      const sweepPos = ((t * 0.8) % 1.0) * imgSize - imgSize / 2;
      const sweep = ctx.createLinearGradient(sweepPos - 30, 0, sweepPos + 30, 0);
      sweep.addColorStop(0, 'rgba(255,255,255,0)');
      sweep.addColorStop(0.5, 'rgba(255,255,255,0.4)');
      sweep.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = sweep;
      ctx.fillRect(-imgSize / 2, -imgSize / 2, imgSize, imgSize);

      ctx.restore();
    }

    // Floating Particles
    if (this.particlesType !== 'none') {
      ctx.save();
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.05;
        if (p.y < 0) p.y = h;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        const a = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.fillStyle = this.particlesType === 'sparks' ? `rgba(255, 215, 120, ${a})` : `rgba(255, 255, 255, ${a * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Text & Branding Overlays
    ctx.save();
    ctx.textAlign = 'center';

    // Top Brand title
    ctx.font = '700 15px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillStyle = spotTint;
    ctx.fillText(this.brandTitle.toUpperCase(), w / 2, 55);

    // Headline
    ctx.font = '800 32px "Cinzel", "Playfair Display", serif, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 12;
    ctx.fillText(this.headline, w / 2, 95);

    // Price Pill at bottom
    ctx.font = '700 18px sans-serif';
    const pillW = ctx.measureText(this.priceBadge).width + 40;
    ctx.fillStyle = 'rgba(20, 24, 32, 0.85)';
    ctx.strokeStyle = spotTint;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(w / 2 - pillW / 2, h - 85, pillW, 36, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.priceBadge, w / 2, h - 61);

    ctx.restore();
  }

  play() {
    this.initAudio();
    this.isPlaying = true;
    document.getElementById('btn-play-pause').innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      Pause Preview
    `;
    this.lastTime = performance.now();
    this.playAudioDrone();
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
    if (this.isPlaying) this.playAudioDrone();
  }

  loop() {
    if (!this.isPlaying) return;
    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.currentTime += delta;
    if (this.currentTime >= this.duration) {
      this.currentTime = 0;
      this.playAudioDrone();
    }

    this.drawFrame(this.currentTime);
    this.updateProgressUI();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  updateProgressUI() {
    const prog = (this.currentTime / this.duration) * 100;
    document.getElementById('playback-progress').style.width = `${Math.min(prog, 100)}%`;

    const curM = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
    const curS = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
    const totM = Math.floor(this.duration / 60).toString().padStart(2, '0');
    const totS = Math.floor(this.duration % 60).toString().padStart(2, '0');
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

      if (this.audioDest && this.audioDest.stream.getAudioTracks().length > 0) {
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
        a.download = `product-showcase-turntable.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        modal.classList.remove('active');
      };

      recorder.start();

      const totalFrames = Math.floor(this.duration * 30);
      let frame = 0;
      const frameStep = 1 / 30;

      const renderNext = () => {
        if (frame >= totalFrames) {
          statusText.textContent = 'Saving turntable video...';
          recorder.stop();
          return;
        }

        const t = frame * frameStep;
        if (frame === 0) this.playAudioDrone();

        this.drawFrame(t);
        frame++;

        const percent = Math.round((frame / totalFrames) * 100);
        progressBar.style.width = `${percent}%`;
        statusText.textContent = `Rendering frame ${frame} of ${totalFrames} (${percent}%)...`;

        setTimeout(renderNext, 16);
      };

      renderNext();

    } catch (err) {
      console.error('Export error:', err);
      alert('Turntable export failed: ' + err.message);
      modal.classList.remove('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const studio = new ShowcaseStudio();
  studio.drawFrame(0);

  // Bind inputs
  document.getElementById('product-model').addEventListener('change', e => {
    studio.model = e.target.value;
    studio.customImage = null;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('upload-model-img').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const img = new Image();
      img.onload = () => {
        studio.customImage = img;
        studio.drawFrame(studio.currentTime);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('pedestal-style').addEventListener('change', e => {
    studio.pedestal = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('spotlight-color').addEventListener('change', e => {
    studio.spotlight = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('particle-effect').addEventListener('change', e => {
    studio.particlesType = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('motion-type').addEventListener('change', e => {
    studio.motionType = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('brand-title').addEventListener('input', e => {
    studio.brandTitle = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('product-headline').addEventListener('input', e => {
    studio.headline = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('price-badge').addEventListener('input', e => {
    studio.priceBadge = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  // Aspect ratio
  document.querySelectorAll('#aspect-selector .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#aspect-selector .chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      studio.setAspect(btn.dataset.aspect);
    });
  });

  // Controls
  document.getElementById('btn-play-pause').addEventListener('click', () => studio.togglePlay());
  document.getElementById('btn-restart').addEventListener('click', () => studio.restart());
  document.getElementById('btn-export-video').addEventListener('click', () => studio.exportVideo());
});