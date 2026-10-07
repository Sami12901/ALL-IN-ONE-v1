// Video Caption Generator & Burner - 100% Client-Side
document.addEventListener('DOMContentLoaded', () => {
  let videoDuration = 0;
  let videoFileName = 'captioned_video';
  let isPlaying = false;
  let animationFrameId = null;
  let captions = [
    { id: 1, start: 0.5, end: 3.0, text: 'Welcome to ALL IN ONE Video Suite!' },
    { id: 2, start: 3.2, end: 6.0, text: 'Create professional subtitles and videos client-side.' }
  ];

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('video-file-input');
  const btnLoadDemo = document.getElementById('btn-load-demo');
  const workspace = document.getElementById('workspace');

  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const hiddenVideo = document.getElementById('hidden-video');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const seekBar = document.getElementById('seek-bar');
  const timeDisplay = document.getElementById('time-display');

  const styleFontSize = document.getElementById('style-font-size');
  const styleColor = document.getElementById('style-color');
  const styleBg = document.getElementById('style-bg');
  const stylePosition = document.getElementById('style-position');

  const btnAddCue = document.getElementById('btn-add-cue');
  const captionsList = document.getElementById('captions-list');
  const captionCount = document.getElementById('caption-count');
  const btnClearCues = document.getElementById('btn-clear-cues');
  const btnPresetCues = document.getElementById('btn-preset-cues');

  const btnExportSrt = document.getElementById('btn-export-srt');
  const btnExportVtt = document.getElementById('btn-export-vtt');
  const btnRenderVideo = document.getElementById('btn-render-video');
  const renderProgress = document.getElementById('render-progress');

  // Format time helpers
  function formatSec(s) {
    if (isNaN(s)) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function formatSrtTime(sec) {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 1000);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  function formatVttTime(sec) {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 1000);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }

  // Draw current frame onto canvas with active captions
  function drawFrame() {
    if (!hiddenVideo.videoWidth) return;

    if (canvas.width !== hiddenVideo.videoWidth || canvas.height !== hiddenVideo.videoHeight) {
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
    }

    ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);

    const currentTime = hiddenVideo.currentTime;
    timeDisplay.textContent = `${formatSec(currentTime)} / ${formatSec(videoDuration)}`;
    if (videoDuration > 0 && !seekBar.matches(':active')) {
      seekBar.value = (currentTime / videoDuration) * 100;
    }

    // Find active captions
    const activeCues = captions.filter(c => currentTime >= c.start && currentTime <= c.end);
    renderCueCardsActive(activeCues);

    if (activeCues.length > 0) {
      const activeText = activeCues.map(c => c.text).join('\n');
      drawCaptionText(activeText);
    }

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(drawFrame);
    }
  }

  function drawCaptionText(text) {
    const fontSize = parseInt(styleFontSize.value, 10) * (canvas.width / 640);
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = text.split('\n');
    const lineHeight = fontSize * 1.35;
    const totalHeight = lines.length * lineHeight;

    let y = canvas.height - totalHeight / 2 - 30;
    if (stylePosition.value === 'center') {
      y = canvas.height / 2;
    } else if (stylePosition.value === 'top') {
      y = 40 + totalHeight / 2;
    }

    const paddingX = 16;
    const paddingY = 8;

    lines.forEach((line, index) => {
      const lineY = y - (totalHeight / 2) + (index * lineHeight) + (lineHeight / 2);
      const metrics = ctx.measureText(line);
      const textWidth = metrics.width;
      const x = canvas.width / 2;

      // Background box
      if (styleBg.value === 'semi-black') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.beginPath();
        ctx.roundRect(x - textWidth / 2 - paddingX, lineY - lineHeight / 2 + 2, textWidth + paddingX * 2, lineHeight - 4, 6);
        ctx.fill();
      } else if (styleBg.value === 'solid-black') {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(x - textWidth / 2 - paddingX, lineY - lineHeight / 2 + 2, textWidth + paddingX * 2, lineHeight - 4, 6);
        ctx.fill();
      }

      // Outline
      if (styleBg.value === 'outline' || styleBg.value === 'none') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(3, fontSize / 8);
        ctx.strokeText(line, x, lineY);
      }

      ctx.fillStyle = styleColor.value;
      ctx.fillText(line, x, lineY);
    });
  }

  function renderCueCardsActive(activeCues) {
    const activeIds = new Set(activeCues.map(c => c.id));
    document.querySelectorAll('.caption-card').forEach(card => {
      const id = parseInt(card.dataset.id, 10);
      if (activeIds.has(id)) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  function renderCueList() {
    captions.sort((a, b) => a.start - b.start);
    captionCount.textContent = captions.length;
    captionsList.innerHTML = '';

    captions.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'caption-card';
      card.dataset.id = c.id;

      card.innerHTML = `
        <div class="caption-times">
          <div>
            <label style="font-size: 0.75rem; color: var(--text-secondary);">Start (s)</label>
            <input type="number" step="0.1" min="0" class="form-input cue-start" value="${c.start.toFixed(1)}" style="padding: 0.3rem 0.5rem; font-size: 0.85rem;">
          </div>
          <div>
            <label style="font-size: 0.75rem; color: var(--text-secondary);">End (s)</label>
            <input type="number" step="0.1" min="0" class="form-input cue-end" value="${c.end.toFixed(1)}" style="padding: 0.3rem 0.5rem; font-size: 0.85rem;">
          </div>
          <button class="btn btn-secondary cue-seek" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; margin-top: 1.1rem;" title="Seek to start">Seek</button>
          <button class="btn btn-secondary cue-del" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; margin-top: 1.1rem; color: var(--danger);" title="Delete caption">&times;</button>
        </div>
        <input type="text" class="form-input cue-text" value="${c.text.replace(/"/g, '&quot;')}" placeholder="Enter caption text..." style="font-size: 0.85rem; padding: 0.4rem 0.6rem;">
      `;

      card.querySelector('.cue-start').addEventListener('change', (e) => {
        c.start = Math.max(0, parseFloat(e.target.value) || 0);
        drawFrame();
      });
      card.querySelector('.cue-end').addEventListener('change', (e) => {
        c.end = Math.max(c.start, parseFloat(e.target.value) || c.start + 1);
        drawFrame();
      });
      card.querySelector('.cue-text').addEventListener('input', (e) => {
        c.text = e.target.value;
        drawFrame();
      });
      card.querySelector('.cue-seek').addEventListener('click', () => {
        hiddenVideo.currentTime = c.start;
        drawFrame();
      });
      card.querySelector('.cue-del').addEventListener('click', () => {
        captions = captions.filter(item => item.id !== c.id);
        renderCueList();
        drawFrame();
      });

      captionsList.appendChild(card);
    });
  }

  // Load video source
  function loadVideoSource(url, name) {
    videoFileName = (name || 'video').replace(/\.[^/.]+$/, '');
    hiddenVideo.src = url;
    hiddenVideo.onloadedmetadata = () => {
      videoDuration = hiddenVideo.duration;
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
      workspace.style.display = 'grid';
      dropZone.style.display = 'none';
      renderCueList();
      hiddenVideo.currentTime = 0;
      drawFrame();
    };
  }

  // Generate synthetic demo video
  async function generateDemoVideo() {
    return new Promise((resolve) => {
      const demoCanvas = document.createElement('canvas');
      demoCanvas.width = 640;
      demoCanvas.height = 360;
      const dctx = demoCanvas.getContext('2d');
      const stream = demoCanvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      recorder.start();
      let frame = 0;
      const totalFrames = 30 * 8; // 8 seconds

      const anim = setInterval(() => {
        const t = frame / 30;
        // Background gradient
        const grad = dctx.createLinearGradient(0, 0, 640, 360);
        grad.addColorStop(0, '#0a101d');
        grad.addColorStop(1, '#1e293b');
        dctx.fillStyle = grad;
        dctx.fillRect(0, 0, 640, 360);

        // Moving glowing orb
        const ox = 320 + Math.sin(t * 2) * 160;
        const oy = 180 + Math.cos(t * 2) * 70;
        const radGrad = dctx.createRadialGradient(ox, oy, 10, ox, oy, 120);
        radGrad.addColorStop(0, 'rgba(78, 133, 191, 0.9)');
        radGrad.addColorStop(1, 'rgba(78, 133, 191, 0)');
        dctx.fillStyle = radGrad;
        dctx.beginPath();
        dctx.arc(ox, oy, 120, 0, Math.PI * 2);
        dctx.fill();

        // Sample text
        dctx.fillStyle = '#f8fafc';
        dctx.font = 'bold 28px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('ALL IN ONE MOTION STUDIO', 320, 100);

        dctx.fillStyle = '#94a3b8';
        dctx.font = '16px monospace';
        dctx.fillText(`TIMECODE: 00:0${Math.floor(t)}.${Math.floor((t % 1) * 100)}`, 320, 260);

        frame++;
        if (frame >= totalFrames) {
          clearInterval(anim);
          recorder.stop();
        }
      }, 1000 / 30);
    });
  }

  // Event Listeners
  dropZone.addEventListener('click', (e) => {
    if (e.target !== btnLoadDemo) fileInput.click();
  });
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      loadVideoSource(URL.createObjectURL(file), file.name);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      loadVideoSource(URL.createObjectURL(file), file.name);
    }
  });

  btnLoadDemo.addEventListener('click', async (e) => {
    e.stopPropagation();
    btnLoadDemo.textContent = 'Generating sample clip...';
    btnLoadDemo.disabled = true;
    const blob = await generateDemoVideo();
    loadVideoSource(URL.createObjectURL(blob), 'sample_demo_clip.webm');
  });

  btnPlayPause.addEventListener('click', () => {
    if (hiddenVideo.paused) {
      hiddenVideo.play();
      isPlaying = true;
      btnPlayPause.textContent = 'Pause';
      drawFrame();
    } else {
      hiddenVideo.pause();
      isPlaying = false;
      btnPlayPause.textContent = 'Play';
      cancelAnimationFrame(animationFrameId);
    }
  });

  hiddenVideo.addEventListener('ended', () => {
    isPlaying = false;
    btnPlayPause.textContent = 'Play';
  });

  seekBar.addEventListener('input', (e) => {
    if (videoDuration > 0) {
      const targetTime = (e.target.value / 100) * videoDuration;
      hiddenVideo.currentTime = targetTime;
      drawFrame();
    }
  });

  btnAddCue.addEventListener('click', () => {
    const cur = hiddenVideo.currentTime;
    captions.push({
      id: Date.now(),
      start: parseFloat(cur.toFixed(1)),
      end: parseFloat((cur + 2.5).toFixed(1)),
      text: 'New subtitle cue'
    });
    renderCueList();
    drawFrame();
  });

  btnClearCues.addEventListener('click', () => {
    if (confirm('Clear all captions?')) {
      captions = [];
      renderCueList();
      drawFrame();
    }
  });

  btnPresetCues.addEventListener('click', () => {
    captions = [
      { id: Date.now() + 1, start: 0.5, end: 3.0, text: 'Welcome to ALL IN ONE Video Suite!' },
      { id: Date.now() + 2, start: 3.2, end: 5.5, text: 'Create professional subtitles client-side.' },
      { id: Date.now() + 3, start: 5.8, end: 7.8, text: 'Instant export with zero server dependencies!' }
    ];
    renderCueList();
    drawFrame();
  });

  [styleFontSize, styleColor, styleBg, stylePosition].forEach(el => {
    el.addEventListener('change', drawFrame);
  });

  // Export SRT
  btnExportSrt.addEventListener('click', () => {
    captions.sort((a, b) => a.start - b.start);
    let srt = '';
    captions.forEach((c, idx) => {
      srt += `${idx + 1}\n`;
      srt += `${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}\n`;
      srt += `${c.text}\n\n`;
    });
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${videoFileName}_captions.srt`;
    a.click();
  });

  // Export VTT
  btnExportVtt.addEventListener('click', () => {
    captions.sort((a, b) => a.start - b.start);
    let vtt = 'WEBVTT\n\n';
    captions.forEach((c, idx) => {
      vtt += `${idx + 1}\n`;
      vtt += `${formatVttTime(c.start)} --> ${formatVttTime(c.end)}\n`;
      vtt += `${c.text}\n\n`;
    });
    const blob = new Blob([vtt], { type: 'text/vtt;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${videoFileName}_captions.vtt`;
    a.click();
  });

  // Burn and render video
  btnRenderVideo.addEventListener('click', async () => {
    if (renderProgress.style.display === 'block') return;
    renderProgress.style.display = 'block';
    btnRenderVideo.disabled = true;

    hiddenVideo.pause();
    isPlaying = false;
    btnPlayPause.textContent = 'Play';

    const renderStream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(renderStream, { mimeType: 'video/webm' });
    const chunks = [];

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const outputBlob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(outputBlob);
      a.download = `${videoFileName}_burned_captions.webm`;
      a.click();
      renderProgress.style.display = 'none';
      btnRenderVideo.disabled = false;
      hiddenVideo.currentTime = 0;
      drawFrame();
    };

    mediaRecorder.start();
    hiddenVideo.currentTime = 0;

    hiddenVideo.play();
    isPlaying = true;

    const recordInterval = setInterval(() => {
      drawFrame();
      if (hiddenVideo.ended || hiddenVideo.currentTime >= videoDuration) {
        clearInterval(recordInterval);
        hiddenVideo.pause();
        isPlaying = false;
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }
    }, 1000 / 30);
  });
});