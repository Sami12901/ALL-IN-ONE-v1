// Product Video Maker Client-Side Engine
// Uses HTML5 Canvas + Web Audio API + MediaRecorder for instant video export

class ProductVideoStudio {
  constructor() {
    this.aspect = '16-9';
    this.width = 1280;
    this.height = 720;
    this.duration = 12.0;
    this.currentTime = 0;
    this.isPlaying = false;
    this.lastTime = 0;
    this.animId = null;

    // Presets & media
    this.currentPreset = 'watch';
    this.customImage = null;
    this.productImages = {};

    // Commercial texts
    this.brandName = 'AURA CHRONOGRAPH';
    this.productName = 'Titanium Tourbillon Master V';
    this.badgeText = 'LIMITED EDITION • 500 PIECES';
    this.salePrice = '$590';
    this.origPrice = '$950';
    this.feature1 = 'Forged Grade 5 Aerospace Titanium Case';
    this.feature2 = 'Anti-Reflective Sapphire Crystal • 72h Reserve';
    this.ctaText = 'ORDER NOW • FREE WORLDWIDE EXPRESS';

    // Aesthetic & Audio
    this.theme = 'gold'; // gold, neon, ruby, violet
    this.soundtrack = 'commercial-beat';

    this.canvas = document.getElementById('preview-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.audioCtx = null;
    this.audioDest = null;
    this.nextBeatTime = 0;

    this.initPresetGraphics();
  }

  getThemeColors() {
    if (this.theme === 'neon') {
      return { primary: '#00ffcc', glow: 'rgba(0, 255, 204, 0.4)', bg1: '#071317', bg2: '#0b2024' };
    } else if (this.theme === 'ruby') {
      return { primary: '#ff3366', glow: 'rgba(255, 51, 102, 0.4)', bg1: '#14080b', bg2: '#200d13' };
    } else if (this.theme === 'violet') {
      return { primary: '#b866ff', glow: 'rgba(184, 102, 255, 0.4)', bg1: '#100a18', bg2: '#1b1228' };
    }
    // Default gold
    return { primary: '#c5a059', glow: 'rgba(197, 160, 89, 0.4)', bg1: '#0d0d0f', bg2: '#171513' };
  }

  initPresetGraphics() {
    ['watch', 'perfume', 'sneaker', 'phone', 'headphones'].forEach(p => {
      this.productImages[p] = this.drawProductGraphic(p);
    });
  }

  drawProductGraphic(preset) {
    const off = document.createElement('canvas');
    off.width = 600;
    off.height = 600;
    const c = off.getContext('2d');

    const cx = 300;
    const cy = 300;

    if (preset === 'watch') {
      // Watch strap
      c.fillStyle = '#1c1c1f';
      c.fillRect(cx - 50, 40, 100, 520);
      c.strokeStyle = '#2d2d32';
      c.lineWidth = 4;
      c.strokeRect(cx - 50, 40, 100, 520);

      // Outer Bezel
      c.fillStyle = '#2b2c30';
      c.beginPath();
      c.arc(cx, cy, 180, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#c5a059';
      c.lineWidth = 12;
      c.stroke();

      // Dial face
      const dialGrad = c.createRadialGradient(cx, cy, 10, cx, cy, 160);
      dialGrad.addColorStop(0, '#1b1e24');
      dialGrad.addColorStop(1, '#090a0d');
      c.fillStyle = dialGrad;
      c.beginPath();
      c.arc(cx, cy, 160, 0, Math.PI * 2);
      c.fill();

      // Hour markers
      c.strokeStyle = '#ffffff';
      c.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6;
        c.beginPath();
        c.moveTo(cx + Math.cos(ang) * 125, cy + Math.sin(ang) * 125);
        c.lineTo(cx + Math.cos(ang) * 145, cy + Math.sin(ang) * 145);
        c.stroke();
      }

      // Hands
      c.strokeStyle = '#c5a059';
      c.lineWidth = 6;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + 60, cy - 70);
      c.stroke();

      c.strokeStyle = '#ffffff';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx - 85, cy + 30);
      c.stroke();

      c.fillStyle = '#c5a059';
      c.beginPath();
      c.arc(cx, cy, 10, 0, Math.PI * 2);
      c.fill();
    } else if (preset === 'perfume') {
      // Bottle Body Glass
      const glass = c.createLinearGradient(cx - 100, cy, cx + 100, cy);
      glass.addColorStop(0, 'rgba(255, 230, 180, 0.4)');
      glass.addColorStop(0.5, 'rgba(255, 215, 120, 0.85)');
      glass.addColorStop(1, 'rgba(200, 150, 70, 0.4)');
      c.fillStyle = glass;
      c.beginPath();
      c.roundRect(cx - 110, cy - 80, 220, 270, 24);
      c.fill();
      c.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      c.lineWidth = 6;
      c.stroke();

      // Golden Cap
      const gold = c.createLinearGradient(cx - 50, cy - 180, cx + 50, cy - 180);
      gold.addColorStop(0, '#99732f');
      gold.addColorStop(0.5, '#ffd985');
      gold.addColorStop(1, '#99732f');
      c.fillStyle = gold;
      c.fillRect(cx - 55, cy - 170, 110, 80);
      c.strokeRect(cx - 55, cy - 170, 110, 80);

      // Sprayer neck
      c.fillStyle = '#666';
      c.fillRect(cx - 30, cy - 90, 60, 15);
    } else if (preset === 'sneaker') {
      // Sole
      c.fillStyle = '#f0f0f5';
      c.beginPath();
      c.ellipse(cx, cy + 90, 190, 40, -0.05, 0, Math.PI * 2);
      c.fill();

      // Sneaker upper
      c.fillStyle = '#ff2b54';
      c.beginPath();
      c.moveTo(cx - 180, cy + 70);
      c.quadraticCurveTo(cx - 160, cy - 20, cx - 70, cy - 30);
      c.quadraticCurveTo(cx + 20, cy - 90, cx + 80, cy - 80);
      c.quadraticCurveTo(cx + 120, cy - 30, cx + 180, cy + 60);
      c.lineTo(cx - 180, cy + 70);
      c.fill();

      // Swoop accent
      c.strokeStyle = '#ffffff';
      c.lineWidth = 14;
      c.beginPath();
      c.moveTo(cx - 90, cy + 20);
      c.quadraticCurveTo(cx, cy + 50, cx + 120, cy - 10);
      c.stroke();
    } else if (preset === 'phone') {
      // Smartphone chassis
      c.fillStyle = '#1e2129';
      c.beginPath();
      c.roundRect(cx - 100, cy - 190, 200, 380, 28);
      c.fill();
      c.strokeStyle = '#5a6275';
      c.lineWidth = 5;
      c.stroke();

      // Screen
      const sGrad = c.createLinearGradient(cx - 90, cy - 175, cx + 90, cy + 175);
      sGrad.addColorStop(0, '#0f2027');
      sGrad.addColorStop(0.5, '#203a43');
      sGrad.addColorStop(1, '#2c5364');
      c.fillStyle = sGrad;
      c.beginPath();
      c.roundRect(cx - 92, cy - 180, 184, 360, 22);
      c.fill();

      // Camera pill / island
      c.fillStyle = '#000000';
      c.beginPath();
      c.roundRect(cx - 30, cy - 165, 60, 18, 9);
      c.fill();
    } else {
      // Headphones
      c.strokeStyle = '#3a3f4d';
      c.lineWidth = 20;
      c.beginPath();
      c.arc(cx, cy - 20, 140, Math.PI, 0);
      c.stroke();

      // Earcups
      c.fillStyle = '#171920';
      c.beginPath();
      c.roundRect(cx - 170, cy - 40, 50, 110, 20);
      c.fill();
      c.strokeRect(cx - 170, cy - 40, 50, 110);

      c.beginPath();
      c.roundRect(cx + 120, cy - 40, 50, 110, 20);
      c.fill();
      c.strokeRect(cx + 120, cy - 40, 50, 110);
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

  triggerAudioBeat(t) {
    if (!this.audioCtx || this.soundtrack === 'silent') return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const beatInterval = 0.5; // 120 BPM
    const beatIndex = Math.floor(t / beatInterval);

    // Kick on beat 0, 2; Snare on beat 1, 3; Bass note
    const isKick = beatIndex % 2 === 0;
    const isSnare = beatIndex % 2 === 1;

    if (isKick) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      if (this.audioDest) gain.connect(this.audioDest);
      osc.start(now);
      osc.stop(now + 0.25);
    }

    if (isSnare) {
      const noiseBuffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.1, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      whiteNoise.connect(gain);
      gain.connect(this.audioCtx.destination);
      if (this.audioDest) gain.connect(this.audioDest);
      whiteNoise.start(now);
    }

    // Melodic bass note
    const bassOsc = this.audioCtx.createOscillator();
    const bassGain = this.audioCtx.createGain();
    const bassNotes = [55, 65.4, 73.4, 82.4]; // A1, C2, D2, E2
    const currentNote = bassNotes[Math.floor(beatIndex / 4) % bassNotes.length];
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(currentNote, now);
    bassGain.gain.setValueAtTime(0.08, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    bassOsc.connect(bassGain);
    bassGain.connect(this.audioCtx.destination);
    if (this.audioDest) bassGain.connect(this.audioDest);
    bassOsc.start(now);
    bassOsc.stop(now + 0.4);
  }

  drawFrame(t) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const colors = this.getThemeColors();

    ctx.clearRect(0, 0, w, h);

    // Background Gradient with subtle radial spotlight
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h));
    bgGrad.addColorStop(0, colors.bg2);
    bgGrad.addColorStop(1, colors.bg1);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Light beam sweep animation
    const sweepProgress = (t % 3.0) / 3.0;
    const sweepX = sweepProgress * (w + 400) - 200;
    const sweepGrad = ctx.createLinearGradient(sweepX - 100, 0, sweepX + 100, h);
    sweepGrad.addColorStop(0, 'rgba(255,255,255,0)');
    sweepGrad.addColorStop(0.5, colors.glow);
    sweepGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle background grid or circles
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let r = 100; r < 600; r += 100) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Determine current commercial stage (0-3s, 3-6s, 6-9s, 9-12s)
    const stage = Math.min(Math.floor(t / 3.0), 3);
    const stageTime = t - (stage * 3.0);
    const stageProgress = stageTime / 3.0;

    // Draw Hero Product in center with floating animation
    const floatY = Math.sin(t * 2) * 12;
    const imgSize = Math.min(w, h) * 0.58;
    const productX = (this.aspect === '16-9') ? w * 0.35 : w * 0.5;
    const productY = h * 0.5 + floatY;

    ctx.save();
    ctx.translate(productX, productY);

    // Product shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, imgSize * 0.45, imgSize * 0.35, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    const currentImg = this.customImage || this.productImages[this.currentPreset];
    if (currentImg && currentImg.complete) {
      ctx.drawImage(currentImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
    }
    ctx.restore();

    // Top Header Badge Bar
    ctx.save();
    ctx.textAlign = 'center';

    // Promotion Pill Badge
    const badgeW = ctx.measureText(this.badgeText).width + 36;
    ctx.fillStyle = colors.glow;
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(w / 2 - badgeW / 2, 28, badgeW, 26, 13);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 12px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.badgeText, w / 2, 45);
    ctx.restore();

    // Text & Dynamic Stages Overlay
    ctx.save();
    const contentX = (this.aspect === '16-9') ? w * 0.68 : w * 0.5;
    ctx.textAlign = (this.aspect === '16-9') ? 'left' : 'center';

    if (stage === 0) {
      // Stage 1: Brand & Hero Product Hook
      const alpha = Math.min(stageProgress * 2, 1.0);
      ctx.globalAlpha = alpha;

      ctx.font = '600 16px sans-serif';
      ctx.fillStyle = colors.primary;
      ctx.fillText(this.brandName.toUpperCase(), contentX, (this.aspect === '16-9') ? h * 0.38 : h * 0.16);

      ctx.font = '800 36px "Cinzel", "Montserrat", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(this.productName, contentX, (this.aspect === '16-9') ? h * 0.46 : h * 0.22);

      ctx.font = '400 18px sans-serif';
      ctx.fillStyle = '#b0b8c4';
      ctx.fillText('Engineered for perfection.', contentX, (this.aspect === '16-9') ? h * 0.53 : h * 0.82);

    } else if (stage === 1) {
      // Stage 2: Feature 1 Highlight with pointer
      const alpha = Math.min(stageProgress * 2, 1.0);
      ctx.globalAlpha = alpha;

      // Pointer reticle on product
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(productX, productY - 20, 20 + Math.sin(t * 8) * 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = colors.primary;
      ctx.font = '700 14px sans-serif';
      ctx.fillText('KEY SPECIFICATION 01', contentX, (this.aspect === '16-9') ? h * 0.40 : h * 0.18);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 28px sans-serif';
      ctx.fillText(this.feature1, contentX, (this.aspect === '16-9') ? h * 0.48 : h * 0.82);

    } else if (stage === 2) {
      // Stage 3: Feature 2 Highlight
      const alpha = Math.min(stageProgress * 2, 1.0);
      ctx.globalAlpha = alpha;

      // Pointer reticle
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(productX + 30, productY + 40, 20 + Math.sin(t * 8) * 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = colors.primary;
      ctx.font = '700 14px sans-serif';
      ctx.fillText('INNOVATION FEATURE 02', contentX, (this.aspect === '16-9') ? h * 0.40 : h * 0.18);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 28px sans-serif';
      ctx.fillText(this.feature2, contentX, (this.aspect === '16-9') ? h * 0.48 : h * 0.82);

    } else {
      // Stage 4: Pricing & Final Call to Action
      const alpha = Math.min(stageProgress * 2, 1.0);
      ctx.globalAlpha = alpha;

      // Original Price crossed out
      ctx.font = '600 22px sans-serif';
      ctx.fillStyle = '#7a8290';
      const origText = `REGULAR ${this.origPrice}`;
      ctx.fillText(origText, contentX, (this.aspect === '16-9') ? h * 0.35 : h * 0.18);

      // Strike line
      const origW = ctx.measureText(origText).width;
      const origStartX = (this.aspect === '16-9') ? contentX : contentX - origW / 2;
      ctx.strokeStyle = '#ff3344';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(origStartX - 4, (this.aspect === '16-9') ? h * 0.35 - 7 : h * 0.18 - 7);
      ctx.lineTo(origStartX + origW + 4, (this.aspect === '16-9') ? h * 0.35 - 7 : h * 0.18 - 7);
      ctx.stroke();

      // Glowing Special Sale Price
      ctx.font = '900 52px sans-serif';
      ctx.fillStyle = colors.primary;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 15;
      ctx.fillText(this.salePrice, contentX, (this.aspect === '16-9') ? h * 0.46 : h * 0.25);
      ctx.shadowBlur = 0;

      // CTA Button
      const btnW = 280;
      const btnH = 50;
      const btnX = (this.aspect === '16-9') ? contentX : contentX - btnW / 2;
      const btnY = (this.aspect === '16-9') ? h * 0.54 : h * 0.80;

      const pulseScale = 1.0 + Math.sin(t * 6) * 0.03;
      ctx.save();
      ctx.translate(btnX + btnW / 2, btnY + btnH / 2);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-(btnX + btnW / 2), -(btnY + btnH / 2));

      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 8);
      ctx.fill();

      ctx.fillStyle = '#0a0a0c';
      ctx.font = '800 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.ctaText.toUpperCase(), btnX + btnW / 2, btnY + 31);
      ctx.restore();
    }
    ctx.restore();

    // Bottom brand disclaimer
    ctx.font = '500 12px sans-serif';
    ctx.fillStyle = '#5c6473';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.brandName} • Official Verified Guarantee`, w / 2, h - 20);
  }

  play() {
    this.initAudio();
    this.isPlaying = true;
    document.getElementById('btn-play-pause').innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      Pause Preview
    `;
    this.lastTime = performance.now();
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
  }

  loop() {
    if (!this.isPlaying) return;
    const now = performance.now();
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    const prevBeat = Math.floor(this.currentTime / 0.5);
    this.currentTime += delta;
    const curBeat = Math.floor(this.currentTime / 0.5);

    if (curBeat !== prevBeat) {
      this.triggerAudioBeat(this.currentTime);
    }

    if (this.currentTime >= this.duration) {
      this.currentTime = 0;
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

      if (this.audioDest && this.soundtrack !== 'silent' && this.audioDest.stream.getAudioTracks().length > 0) {
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
        const sanitized = this.productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        a.download = `${sanitized}-commercial.webm`;
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
          statusText.textContent = 'Packaging commercial video...';
          recorder.stop();
          return;
        }

        const t = frame * frameStep;
        if (frame % 15 === 0) { // every 0.5s beat
          this.triggerAudioBeat(t);
        }

        this.drawFrame(t);
        frame++;

        const percent = Math.round((frame / totalFrames) * 100);
        progressBar.style.width = `${percent}%`;
        statusText.textContent = `Rendering commercial frame ${frame} of ${totalFrames} (${percent}%)...`;

        setTimeout(renderNext, 16);
      };

      renderNext();

    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + err.message);
      modal.classList.remove('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const studio = new ProductVideoStudio();
  studio.drawFrame(0);

  // Preset selector
  document.querySelectorAll('#preset-selector .preset-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#preset-selector .preset-card-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      studio.currentPreset = btn.dataset.preset;
      studio.customImage = null;
      studio.drawFrame(studio.currentTime);
    });
  });

  // Upload image
  document.getElementById('upload-product-img').addEventListener('change', e => {
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

  // Inputs
  const bindInput = (id, prop) => {
    document.getElementById(id).addEventListener('input', e => {
      studio[prop] = e.target.value;
      studio.drawFrame(studio.currentTime);
    });
  };
  bindInput('brand-name', 'brandName');
  bindInput('product-name', 'productName');
  bindInput('badge-text', 'badgeText');
  bindInput('sale-price', 'salePrice');
  bindInput('orig-price', 'origPrice');
  bindInput('feature-1', 'feature1');
  bindInput('feature-2', 'feature2');
  bindInput('cta-text', 'ctaText');

  document.getElementById('color-theme').addEventListener('change', e => {
    studio.theme = e.target.value;
    studio.drawFrame(studio.currentTime);
  });

  document.getElementById('soundtrack-style').addEventListener('change', e => {
    studio.soundtrack = e.target.value;
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