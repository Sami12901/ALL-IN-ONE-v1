// AI Avatar Creator - 100% Client-Side Procedural Talking Head Engine
document.addEventListener('DOMContentLoaded', () => {
  let isSpeaking = false;
  let isRecording = false;
  let currentModel = 'sophia';
  let currentBackdrop = 'cyber';
  let voices = [];
  let animId = null;
  let blinkCounter = 0;
  let mouthOpenness = 0;

  const canvas = document.getElementById('avatar-canvas');
  const ctx = canvas.getContext('2d');

  const btnPlayAvatar = document.getElementById('btn-play-avatar');
  const btnStopAvatar = document.getElementById('btn-stop-avatar');
  const speechStatus = document.getElementById('speech-status');

  const avatarCards = document.querySelectorAll('.avatar-card');
  const avatarScript = document.getElementById('avatar-script');
  const selectBackdrop = document.getElementById('select-backdrop');
  const selectVoice = document.getElementById('select-voice');

  const btnExportAvatar = document.getElementById('btn-export-avatar');
  const renderMsg = document.getElementById('render-msg');

  function populateVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    selectVoice.innerHTML = '';
    voices.forEach((v, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${v.name} (${v.lang})`;
      selectVoice.appendChild(opt);
    });
  }

  if ('speechSynthesis' in window) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Draw procedural virtual studio backdrop
  function drawBackdrop(w, h) {
    if (currentBackdrop === 'cyber') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Glass cyber loft panels
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(100, 80, w - 200, h - 160);

      // Distant neon lights
      ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
      ctx.beginPath();
      ctx.arc(w * 0.75, 180, 140, 0, Math.PI * 2);
      ctx.fill();

    } else if (currentBackdrop === 'news') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#091e3a');
      grad.addColorStop(0.7, '#1e3a8a');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // World map contour simulation lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      for (let y = 80; y < 400; y += 40) {
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(w - 80, y);
        ctx.stroke();
      }

    } else {
      // Minimal Studio
      const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w / 1.5);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Draw procedural talking avatar
  function drawAvatarFrame() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    drawBackdrop(w, h);

    const cx = w / 2;
    const cy = h / 2 + 50;

    // Subtle head float / breathing micro-motion
    const now = Date.now();
    const headTilt = Math.sin(now * 0.0015) * 4;
    const breatheY = Math.sin(now * 0.002) * 5;

    // Eye blinking logic
    blinkCounter++;
    const isBlinking = blinkCounter % 140 < 6;

    // Lip sync mouth opening
    if (isSpeaking) {
      // Dynamic mouth cycle based on audio wave rhythm
      mouthOpenness = Math.abs(Math.sin(now * 0.015)) * 18 + 4;
    } else {
      mouthOpenness = 2; // Resting closed
    }

    ctx.save();
    ctx.translate(cx + headTilt, cy + breatheY);

    // Torso / Suit Clothing
    if (currentModel === 'sophia') {
      // Executive Blazer (Burgundy / Rose)
      ctx.fillStyle = '#831843';
      ctx.beginPath();
      ctx.moveTo(-180, 260);
      ctx.lineTo(-70, 70);
      ctx.lineTo(70, 70);
      ctx.lineTo(180, 260);
      ctx.closePath();
      ctx.fill();

      // Shirt
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-40, 70);
      ctx.lineTo(0, 150);
      ctx.lineTo(40, 70);
      ctx.closePath();
      ctx.fill();

    } else if (currentModel === 'marcus') {
      // Tech Navy Blazer
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(-180, 260);
      ctx.lineTo(-70, 70);
      ctx.lineTo(70, 70);
      ctx.lineTo(180, 260);
      ctx.closePath();
      ctx.fill();

      // Dark T-shirt
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 70, 45, 0, Math.PI);
      ctx.fill();

    } else if (currentModel === 'aaliyah') {
      // Emerald Modest Attire
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(-190, 260);
      ctx.lineTo(-80, 70);
      ctx.lineTo(80, 70);
      ctx.lineTo(190, 260);
      ctx.closePath();
      ctx.fill();

      // Silk Gold Scarf
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-60, 70);
      ctx.lineTo(0, 140);
      ctx.lineTo(60, 70);
      ctx.closePath();
      ctx.fill();

    } else {
      // Kenji - Cyber Synthetic Armor
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-190, 260);
      ctx.lineTo(-80, 70);
      ctx.lineTo(80, 70);
      ctx.lineTo(190, 260);
      ctx.closePath();
      ctx.fill();

      // Neon chestplate light
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(-50, 90, 100, 30);
    }

    // Neck
    ctx.fillStyle = '#e2b388';
    ctx.fillRect(-32, -10, 64, 85);

    // Head Oval
    ctx.fillStyle = '#fcd39a';
    ctx.beginPath();
    ctx.ellipse(0, -90, 85, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeY = -105;
    const leftEyeX = -36;
    const rightEyeX = 36;

    if (isBlinking) {
      // Closed eye lines
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftEyeX - 14, eyeY); ctx.lineTo(leftEyeX + 14, eyeY);
      ctx.moveTo(rightEyeX - 14, eyeY); ctx.lineTo(rightEyeX + 14, eyeY);
      ctx.stroke();
    } else {
      // Sclera
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(leftEyeX, eyeY, 14, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(rightEyeX, eyeY, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Irises
      ctx.fillStyle = currentModel === 'kenji' ? '#38bdf8' : '#334155';
      ctx.beginPath();
      ctx.arc(leftEyeX, eyeY, 5, 0, Math.PI * 2);
      ctx.arc(rightEyeX, eyeY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyebrows
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftEyeX - 16, eyeY - 14); ctx.lineTo(leftEyeX + 14, eyeY - 12);
    ctx.moveTo(rightEyeX - 14, eyeY - 12); ctx.lineTo(rightEyeX + 16, eyeY - 14);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -95);
    ctx.lineTo(4, -65);
    ctx.lineTo(-4, -65);
    ctx.stroke();

    // Mouth with Lip-Sync Aperture
    const mouthY = -35;
    ctx.fillStyle = '#991b1b'; // Inner mouth
    ctx.beginPath();
    ctx.ellipse(0, mouthY, 22, mouthOpenness, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lips
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-24, mouthY);
    ctx.quadraticCurveTo(0, mouthY - 4, 24, mouthY);
    ctx.stroke();

    // Hair Style
    ctx.fillStyle = currentModel === 'marcus' ? '#0f172a' : (currentModel === 'sophia' ? '#451a03' : '#1e293b');
    if (currentModel === 'sophia') {
      // Long elegant hair
      ctx.beginPath();
      ctx.arc(0, -120, 95, Math.PI * 0.8, Math.PI * 2.2);
      ctx.lineTo(95, 30);
      ctx.lineTo(70, 30);
      ctx.lineTo(70, -80);
      ctx.lineTo(-70, -80);
      ctx.lineTo(-70, 30);
      ctx.lineTo(-95, 30);
      ctx.closePath();
      ctx.fill();
    } else if (currentModel === 'marcus') {
      // Short modern crop
      ctx.beginPath();
      ctx.arc(0, -115, 90, Math.PI * 0.85, Math.PI * 2.15);
      ctx.closePath();
      ctx.fill();
    } else if (currentModel === 'aaliyah') {
      // Elegant Hijab covering head
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.ellipse(0, -95, 98, 125, 0, 0, Math.PI * 2);
      ctx.fill();

      // Face cutout
      ctx.fillStyle = '#fcd39a';
      ctx.beginPath();
      ctx.ellipse(0, -85, 65, 85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Re-draw face features above cutout
      if (!isBlinking) {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 5, 0, Math.PI * 2);
        ctx.arc(rightEyeX, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.ellipse(0, mouthY, 20, mouthOpenness, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Lower-Third Presenter Card
    const cardX = 80;
    const cardY = h - 110;
    ctx.fillStyle = 'rgba(10, 15, 26, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, 440, 68, 14);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const presenterName = currentModel.toUpperCase();
    ctx.font = '800 20px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`${presenterName} • AI VIRTUAL HOST`, cardX + 24, cardY + 30);

    ctx.font = '500 14px "Inter", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('ALL IN ONE VIRTUAL PRESENTER STUDIO', cardX + 24, cardY + 52);

    animId = requestAnimationFrame(drawAvatarFrame);
  }

  function startSpeech() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const text = avatarScript.value.trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (voices.length > 0) {
      utterance.voice = voices[selectVoice.value || 0];
    }
    utterance.rate = 1.0;
    utterance.pitch = currentModel === 'sophia' || currentModel === 'aaliyah' ? 1.1 : 0.95;

    utterance.onstart = () => {
      isSpeaking = true;
      speechStatus.textContent = 'Speaking (Lip Sync Active)';
      speechStatus.style.color = '#10b981';
      btnPlayAvatar.textContent = 'Speaking...';
    };

    utterance.onend = () => {
      isSpeaking = false;
      mouthOpenness = 2;
      speechStatus.textContent = 'Speech Completed';
      speechStatus.style.color = 'var(--text-secondary)';
      btnPlayAvatar.textContent = 'Speak & Animate';
    };

    utterance.onerror = () => {
      isSpeaking = false;
      mouthOpenness = 2;
      speechStatus.textContent = 'Idle';
      btnPlayAvatar.textContent = 'Speak & Animate';
    };

    window.speechSynthesis.speak(utterance);
  }

  btnPlayAvatar.addEventListener('click', startSpeech);

  btnStopAvatar.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      mouthOpenness = 2;
      speechStatus.textContent = 'Stopped';
      btnPlayAvatar.textContent = 'Speak & Animate';
    }
  });

  avatarCards.forEach(card => {
    card.addEventListener('click', () => {
      avatarCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentModel = card.dataset.model;
    });
  });

  selectBackdrop.addEventListener('change', (e) => {
    currentBackdrop = e.target.value;
  });

  // Export Avatar Video
  btnExportAvatar.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportAvatar.disabled = true;
    renderMsg.style.display = 'block';

    const words = avatarScript.value.trim().split(/\s+/).length;
    const durSec = Math.max(4, Math.round(words * 0.45));

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ai_avatar_${currentModel}.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportAvatar.disabled = false;
      isRecording = false;
    };

    recorder.start();
    startSpeech();

    setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, durSec * 1000);
  });

  drawAvatarFrame();
});