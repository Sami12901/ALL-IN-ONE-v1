// Mute Video - 100% Client-Side Audio Stripper
document.addEventListener('DOMContentLoaded', () => {
  let videoFileName = 'silent_video';
  let videoDuration = 0;
  let isExporting = false;

  const dropZone = document.getElementById('drop-zone');
  const videoInput = document.getElementById('video-input');
  const btnLoadDemo = document.getElementById('btn-load-demo');
  const muteStudio = document.getElementById('mute-studio');

  const previewVideo = document.getElementById('preview-video');
  const renderCanvas = document.getElementById('render-canvas');
  const ctx = renderCanvas.getContext('2d');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const seekBar = document.getElementById('seek-bar');
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  const timeText = document.getElementById('time-text');

  const metricResolution = document.getElementById('metric-resolution');
  const metricDuration = document.getElementById('metric-duration');
  const btnExportMuted = document.getElementById('btn-export-muted');
  const exportProgressBar = document.getElementById('export-progress-bar');
  const exportPercentLabel = document.getElementById('export-percent-label');
  const progressFill = document.getElementById('progress-fill');

  function formatSec(s) {
    if (isNaN(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  // Load Video File
  function loadVideo(url, name) {
    videoFileName = (name || 'video').replace(/\.[^/.]+$/, '');
    previewVideo.src = url;
    previewVideo.muted = true; // Default muted preview
    previewVideo.onloadedmetadata = () => {
      videoDuration = previewVideo.duration;
      metricResolution.textContent = `${previewVideo.videoWidth} x ${previewVideo.videoHeight}`;
      metricDuration.textContent = `${videoDuration.toFixed(1)}s`;
      timeText.textContent = `00:00 / ${formatSec(videoDuration)}`;

      renderCanvas.width = previewVideo.videoWidth;
      renderCanvas.height = previewVideo.videoHeight;

      dropZone.style.display = 'none';
      muteStudio.style.display = 'flex';
    };
  }

  // Synthetic Demo Video with synth audio
  async function generateDemoVideoWithAudio() {
    return new Promise((resolve) => {
      const demoCanvas = document.createElement('canvas');
      demoCanvas.width = 640;
      demoCanvas.height = 360;
      const dctx = demoCanvas.getContext('2d');

      const stream = demoCanvas.captureStream(30);

      // Add synthetic Web Audio track to demonstrate audio removal
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const actx = new AudioContextClass();
        const osc = actx.createOscillator();
        const dst = actx.createMediaStreamDestination();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, actx.currentTime);
        osc.connect(dst);
        osc.start();
        dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
      } catch (e) {
        /* proceed if Web Audio is restricted */
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      recorder.start();
      let frame = 0;
      const totalFrames = 30 * 6; // 6 seconds

      const timer = setInterval(() => {
        const t = frame / 30;
        dctx.fillStyle = '#0f172a';
        dctx.fillRect(0, 0, 640, 360);

        // Soundwave simulation
        dctx.strokeStyle = '#ef4444';
        dctx.lineWidth = 3;
        dctx.beginPath();
        for (let x = 0; x < 640; x += 10) {
          const y = 180 + Math.sin(t * 5 + x * 0.05) * 40;
          if (x === 0) dctx.moveTo(x, y);
          else dctx.lineTo(x, y);
        }
        dctx.stroke();

        dctx.fillStyle = '#ffffff';
        dctx.font = 'bold 24px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('VIDEO WITH AUDIO TRACK', 320, 80);

        dctx.fillStyle = '#94a3b8';
        dctx.font = '16px monospace';
        dctx.fillText(`Frame: ${frame} / ${totalFrames}`, 320, 300);

        frame++;
        if (frame >= totalFrames) {
          clearInterval(timer);
          recorder.stop();
        }
      }, 1000 / 30);
    });
  }

  // Events
  dropZone.addEventListener('click', (e) => {
    if (e.target !== btnLoadDemo) videoInput.click();
  });
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent)'; });
  dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'var(--border)'; });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border)';
    const file = e.dataTransfer.files[0];
    if (file) loadVideo(URL.createObjectURL(file), file.name);
  });

  videoInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      loadVideo(URL.createObjectURL(file), file.name);
    }
  });

  btnLoadDemo.addEventListener('click', async (e) => {
    e.stopPropagation();
    btnLoadDemo.textContent = 'Generating clip with sound...';
    btnLoadDemo.disabled = true;
    const blob = await generateDemoVideoWithAudio();
    loadVideo(URL.createObjectURL(blob), 'demo_with_sound.webm');
  });

  btnPlayPause.addEventListener('click', () => {
    if (previewVideo.paused) {
      previewVideo.play();
      btnPlayPause.textContent = 'Pause';
    } else {
      previewVideo.pause();
      btnPlayPause.textContent = 'Play';
    }
  });

  previewVideo.addEventListener('timeupdate', () => {
    if (!seekBar.matches(':active') && videoDuration > 0) {
      seekBar.value = (previewVideo.currentTime / videoDuration) * 100;
    }
    timeText.textContent = `${formatSec(previewVideo.currentTime)} / ${formatSec(videoDuration)}`;
  });

  previewVideo.addEventListener('ended', () => {
    btnPlayPause.textContent = 'Play';
  });

  seekBar.addEventListener('input', (e) => {
    if (videoDuration > 0) {
      previewVideo.currentTime = (e.target.value / 100) * videoDuration;
    }
  });

  btnToggleSound.addEventListener('click', () => {
    previewVideo.muted = !previewVideo.muted;
    btnToggleSound.textContent = previewVideo.muted ? 'Audio: Muted' : 'Audio: Active';
    btnToggleSound.style.color = previewVideo.muted ? 'var(--text-secondary)' : 'var(--accent)';
  });

  // Export Muted Video
  btnExportMuted.addEventListener('click', async () => {
    if (isExporting) return;
    isExporting = true;
    btnExportMuted.disabled = true;
    exportProgressBar.style.display = 'flex';

    previewVideo.pause();
    previewVideo.currentTime = 0;

    renderCanvas.width = previewVideo.videoWidth || 640;
    renderCanvas.height = previewVideo.videoHeight || 360;

    // Capture ONLY video track from canvas stream
    const canvasStream = renderCanvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });
    const chunks = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const silentBlob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(silentBlob);
      a.download = `muted_${videoFileName}.webm`;
      a.click();

      exportProgressBar.style.display = 'none';
      btnExportMuted.disabled = false;
      isExporting = false;
      previewVideo.currentTime = 0;
    };

    mediaRecorder.start();
    await previewVideo.play();

    const drawInterval = setInterval(() => {
      ctx.drawImage(previewVideo, 0, 0, renderCanvas.width, renderCanvas.height);
      const progress = Math.min(100, (previewVideo.currentTime / videoDuration) * 100);
      progressFill.style.width = `${progress}%`;
      exportPercentLabel.textContent = `${Math.floor(progress)}%`;

      if (previewVideo.ended || previewVideo.currentTime >= videoDuration) {
        clearInterval(drawInterval);
        previewVideo.pause();
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }
    }, 1000 / 30);
  });
});