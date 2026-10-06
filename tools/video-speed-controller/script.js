// Video Playback Velocity Master - ALL IN ONE

let currentSpeed = 1.0;
let duration = 0;
let loopA = null;
let loopB = null;

// DOM Elements
const dropZone = document.getElementById('video-drop-zone');
const fileInput = document.getElementById('video-file-input');
const videoUrlInput = document.getElementById('video-url-input');
const btnLoadUrl = document.getElementById('btn-load-url');
const btnLoadDemo = document.getElementById('btn-load-demo');
const playerStudioPanel = document.getElementById('player-studio-panel');

const mainVideo = document.getElementById('main-video');
const floatingSpeedText = document.getElementById('floating-speed-text');
const overlayCurrentTime = document.getElementById('overlay-current-time');
const overlayTotalTime = document.getElementById('overlay-total-time');

const speedStatusDesc = document.getElementById('speed-status-desc');
const speedPills = document.querySelectorAll('.btn-speed-pill');
const speedSlider = document.getElementById('speed-slider');
const speedNumberInput = document.getElementById('speed-number-input');

const btnSpeedSub01 = document.getElementById('btn-speed-sub-01');
const btnSpeedSub005 = document.getElementById('btn-speed-sub-005');
const btnSpeedReset = document.getElementById('btn-speed-reset');
const btnSpeedAdd005 = document.getElementById('btn-speed-add-005');
const btnSpeedAdd01 = document.getElementById('btn-speed-add-01');

const checkPreservePitch = document.getElementById('check-preserve-pitch');
const statPitchStatus = document.getElementById('stat-pitch-status');

const btnFramePrev = document.getElementById('btn-frame-prev');
const btnFrameNext = document.getElementById('btn-frame-next');
const btnStepSub1s = document.getElementById('btn-step-sub-1s');
const btnStepAdd1s = document.getElementById('btn-step-add-1s');

const checkLoopActive = document.getElementById('check-loop-active');
const btnSetLoopA = document.getElementById('btn-set-loop-a');
const btnSetLoopB = document.getElementById('btn-set-loop-b');
const btnClearLoop = document.getElementById('btn-clear-loop');
const loopAVal = document.getElementById('loop-a-val');
const loopBVal = document.getElementById('loop-b-val');

const statOrigLength = document.getElementById('stat-orig-length');
const statAdjLength = document.getElementById('stat-adj-length');
const statTimeEconomy = document.getElementById('stat-time-economy');

// Format seconds into MM:SS.m
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
}

// Generate animated test video with speedometer
async function generateDemoVideo() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    recorder.start();

    const fps = 30;
    const totalFrames = fps * 8; // 8 seconds
    let frame = 0;

    const interval = setInterval(() => {
      const t = frame / fps;
      ctx.fillStyle = '#090d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Outer speed dial ring
      ctx.strokeStyle = 'rgba(78, 133, 191, 0.3)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.stroke();

      // Spinning tachometer needle
      const angle = (t * 2 * Math.PI) - Math.PI / 2;
      ctx.strokeStyle = '#4e85bf';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 90, cy + Math.sin(angle) * 90);
      ctx.stroke();

      // Center cap
      ctx.fillStyle = '#89aacc';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Title & Velocity Readout
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VELOCITY BENCHMARK TEST', cx, 45);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 36px monospace';
      ctx.fillText(formatTime(t), cx, canvas.height - 40);

      frame++;
      if (frame >= totalFrames) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / fps);
  });
}

// Load Video Source
function loadVideo(src) {
  mainVideo.src = src;
  mainVideo.load();

  mainVideo.onloadedmetadata = () => {
    duration = mainVideo.duration || 1;
    overlayTotalTime.textContent = formatTime(duration);
    statOrigLength.textContent = formatTime(duration);

    applySpeed(currentSpeed);
    applyPitchPreservation();
    playerStudioPanel.style.display = 'block';
  };
}

// Speed Adjustment Engine
function applySpeed(speed) {
  currentSpeed = Math.max(0.1, Math.min(10.0, parseFloat(speed) || 1.0));
  mainVideo.playbackRate = currentSpeed;

  // Update UI Elements
  floatingSpeedText.textContent = `${currentSpeed.toFixed(2)}x`;
  speedNumberInput.value = currentSpeed.toFixed(2);
  speedSlider.value = currentSpeed.toFixed(2);

  // Update speed status description
  if (currentSpeed === 1.0) {
    speedStatusDesc.textContent = 'Normal Speed (1.0x)';
  } else if (currentSpeed < 1.0) {
    speedStatusDesc.textContent = `Slow-Motion (${(1 / currentSpeed).toFixed(1)}x Slower)`;
  } else {
    speedStatusDesc.textContent = `Fast-Forward (${currentSpeed.toFixed(1)}x Faster)`;
  }

  // Update Speed Pills Highlight
  speedPills.forEach((pill) => {
    const pSpeed = parseFloat(pill.dataset.speed);
    if (Math.abs(pSpeed - currentSpeed) < 0.01) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Update Time Economy Analytics
  updateAnalytics();
}

// Apply Pitch Preservation
function applyPitchPreservation() {
  const preserve = checkPreservePitch.checked;
  mainVideo.preservesPitch = preserve;
  if ('mozPreservesPitch' in mainVideo) mainVideo.mozPreservesPitch = preserve;
  if ('webkitPreservesPitch' in mainVideo) mainVideo.webkitPreservesPitch = preserve;

  statPitchStatus.textContent = preserve ? 'Preserved (Natural)' : 'Scaled (Analog Pitch Shift)';
  statPitchStatus.style.color = preserve ? '#10b981' : '#f59e0b';
}

// Update Time Economy Analytics
function updateAnalytics() {
  if (duration <= 0) return;
  const adjDuration = duration / currentSpeed;
  statAdjLength.textContent = formatTime(adjDuration);

  const diff = duration - adjDuration;
  if (currentSpeed > 1.0) {
    const savedPct = Math.round(((duration - adjDuration) / duration) * 100);
    statTimeEconomy.textContent = `Saves ${formatTime(diff)} (${savedPct}% faster)`;
    statTimeEconomy.style.color = '#10b981';
  } else if (currentSpeed < 1.0) {
    const extraTime = Math.abs(diff);
    statTimeEconomy.textContent = `+${formatTime(extraTime)} in slow-mo`;
    statTimeEconomy.style.color = '#f59e0b';
  } else {
    statTimeEconomy.textContent = '0.0s (Normal 1.0x)';
    statTimeEconomy.style.color = 'var(--text-secondary)';
  }
}

// Video Time Update & Looping Check
mainVideo.addEventListener('timeupdate', () => {
  const curr = mainVideo.currentTime;
  overlayCurrentTime.textContent = formatTime(curr);

  // Check A-B Looper
  if (checkLoopActive.checked && loopA !== null && loopB !== null && loopB > loopA) {
    if (curr >= loopB || curr < loopA) {
      mainVideo.currentTime = loopA;
      mainVideo.play();
    }
  }
});

// Speed Pills Click
speedPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    applySpeed(parseFloat(pill.dataset.speed));
  });
});

// Slider & Number Input
speedSlider.addEventListener('input', (e) => {
  applySpeed(parseFloat(e.target.value));
});

speedNumberInput.addEventListener('input', (e) => {
  applySpeed(parseFloat(e.target.value));
});

// Stepper Buttons
btnSpeedSub01.addEventListener('click', () => applySpeed(currentSpeed - 0.1));
btnSpeedSub005.addEventListener('click', () => applySpeed(currentSpeed - 0.05));
btnSpeedReset.addEventListener('click', () => applySpeed(1.0));
btnSpeedAdd005.addEventListener('click', () => applySpeed(currentSpeed + 0.05));
btnSpeedAdd01.addEventListener('click', () => applySpeed(currentSpeed + 0.1));

// Pitch Preservation Checkbox
checkPreservePitch.addEventListener('change', applyPitchPreservation);

// Frame Stepping (1/30th second)
btnFramePrev.addEventListener('click', () => {
  mainVideo.pause();
  mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 1 / 30);
});

btnFrameNext.addEventListener('click', () => {
  mainVideo.pause();
  mainVideo.currentTime = Math.min(duration, mainVideo.currentTime + 1 / 30);
});

btnStepSub1s.addEventListener('click', () => {
  mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 1.0);
});

btnStepAdd1s.addEventListener('click', () => {
  mainVideo.currentTime = Math.min(duration, mainVideo.currentTime + 1.0);
});

// A-B Looper
btnSetLoopA.addEventListener('click', () => {
  loopA = mainVideo.currentTime;
  loopAVal.textContent = formatTime(loopA);
  checkLoopActive.checked = true;
});

btnSetLoopB.addEventListener('click', () => {
  loopB = mainVideo.currentTime;
  loopBVal.textContent = formatTime(loopB);
  checkLoopActive.checked = true;
});

btnClearLoop.addEventListener('click', () => {
  loopA = null;
  loopB = null;
  loopAVal.textContent = '--:--';
  loopBVal.textContent = '--:--';
  checkLoopActive.checked = false;
});

// File Upload Handlers
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    loadVideo(URL.createObjectURL(file));
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    loadVideo(URL.createObjectURL(file));
  }
});

// URL Loading
btnLoadUrl.addEventListener('click', () => {
  const url = videoUrlInput.value.trim();
  if (url) {
    loadVideo(url);
  }
});

// Demo Video Loading
btnLoadDemo.addEventListener('click', async () => {
  btnLoadDemo.textContent = 'Generating Demo...';
  const blob = await generateDemoVideo();
  btnLoadDemo.textContent = 'Load Demo Video';
  loadVideo(URL.createObjectURL(blob));
});

// Keyboard Shortcuts Listener
window.addEventListener('keydown', (e) => {
  // Ignore typing inside inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (mainVideo.paused) mainVideo.play();
    else mainVideo.pause();
  } else if (e.key === '[') {
    applySpeed(currentSpeed - 0.1);
  } else if (e.key === ']') {
    applySpeed(currentSpeed + 0.1);
  } else if (e.key === 'r' || e.key === 'R') {
    applySpeed(1.0);
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    mainVideo.pause();
    mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 1 / 30);
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    mainVideo.pause();
    mainVideo.currentTime = Math.min(duration, mainVideo.currentTime + 1 / 30);
  } else if (e.key === 'l' || e.key === 'L') {
    checkLoopActive.checked = !checkLoopActive.checked;
  }
});