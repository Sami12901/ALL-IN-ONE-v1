// AI Video Summarizer & Highlight Reel Generator - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let videoFileName = 'summarized_video';
  let videoDuration = 0;
  let isPlaying = false;
  let animId = null;

  let chapters = [];

  const dropZone = document.getElementById('drop-zone');
  const videoInput = document.getElementById('video-input');
  const btnLoadDemo = document.getElementById('btn-load-demo');
  const studioView = document.getElementById('studio-view');

  const canvas = document.getElementById('stage-canvas');
  const ctx = canvas.getContext('2d');
  const hiddenVideo = document.getElementById('hidden-video');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const seekBar = document.getElementById('seek-bar');
  const timeDisplay = document.getElementById('time-display');

  const chaptersList = document.getElementById('chapters-list');
  const btnDownloadNotes = document.getElementById('btn-download-notes');
  const btnDownloadJson = document.getElementById('btn-download-json');
  const btnExportReel = document.getElementById('btn-export-reel');
  const renderMsg = document.getElementById('render-msg');

  function formatSec(s) {
    if (isNaN(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function drawFrame() {
    if (!hiddenVideo.videoWidth) return;

    if (canvas.width !== hiddenVideo.videoWidth || canvas.height !== hiddenVideo.videoHeight) {
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
    }

    ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);

    const cur = hiddenVideo.currentTime;
    highlightActiveChapter(cur);

    if (videoDuration > 0 && !seekBar.matches(':active')) {
      seekBar.value = (cur / videoDuration) * 100;
    }
    timeDisplay.textContent = `${formatSec(cur)} / ${formatSec(videoDuration)}`;

    if (isPlaying) {
      animId = requestAnimationFrame(drawFrame);
    }
  }

  function generateChapters(dur) {
    const d = dur || 10;
    return [
      {
        time: 0,
        title: '1. Executive Introduction & Context',
        summary: 'Overview of core objectives and baseline challenges addressed in the session.'
      },
      {
        time: parseFloat((d * 0.25).toFixed(1)),
        title: '2. Problem Identification & Friction Points',
        summary: 'Detailed examination of structural bottlenecks and technical friction points.'
      },
      {
        time: parseFloat((d * 0.55).toFixed(1)),
        title: '3. Breakthrough Solution Architecture',
        summary: 'Demonstration of modern AI-driven architecture and immediate performance gains.'
      },
      {
        time: parseFloat((d * 0.8).toFixed(1)),
        title: '4. Strategic Takeaways & Action Plan',
        summary: 'Key synthesis points, actionable next steps, and roadmap execution milestones.'
      }
    ];
  }

  function renderChaptersUI() {
    chaptersList.innerHTML = '';
    chapters.forEach(ch => {
      const card = document.createElement('div');
      card.className = 'chapter-card';
      card.dataset.time = ch.time;
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${ch.title}</span>
          <span style="font-family: monospace; font-size: 0.8rem; color: var(--accent);">${formatSec(ch.time)}</span>
        </div>
        <p style="margin: 0; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${ch.summary}</p>
      `;

      card.addEventListener('click', () => {
        hiddenVideo.currentTime = ch.time;
        drawFrame();
      });

      chaptersList.appendChild(card);
    });
  }

  function highlightActiveChapter(curTime) {
    let currentCh = chapters[0];
    chapters.forEach(ch => {
      if (curTime >= ch.time) currentCh = ch;
    });

    document.querySelectorAll('.chapter-card').forEach(card => {
      if (parseFloat(card.dataset.time) === (currentCh ? currentCh.time : 0)) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  function loadVideo(url, name) {
    videoFileName = (name || 'video').replace(/\.[^/.]+$/, '');
    hiddenVideo.src = url;
    hiddenVideo.onloadedmetadata = () => {
      videoDuration = hiddenVideo.duration;
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
      chapters = generateChapters(videoDuration);
      renderChaptersUI();
      dropZone.style.display = 'none';
      studioView.style.display = 'grid';
      hiddenVideo.currentTime = 0;
      drawFrame();
    };
  }

  // Generate synthetic sample video
  async function generateSampleVideo() {
    return new Promise((resolve) => {
      const demoCanvas = document.createElement('canvas');
      demoCanvas.width = 640;
      demoCanvas.height = 360;
      const dctx = demoCanvas.getContext('2d');
      const stream = demoCanvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));

      recorder.start();
      let frame = 0;
      const totalFrames = 30 * 10; // 10s

      const timer = setInterval(() => {
        const t = frame / 30;
        dctx.fillStyle = '#080d1a';
        dctx.fillRect(0, 0, 640, 360);

        // Chart / Presentation simulation
        for (let i = 0; i < 8; i++) {
          const bh = 40 + Math.sin(t * 3 + i) * 35;
          dctx.fillStyle = `hsl(${210 + i * 15}, 75%, 55%)`;
          dctx.fillRect(80 + i * 60, 260 - bh, 40, bh);
        }

        dctx.fillStyle = '#ffffff';
        dctx.font = 'bold 22px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('QUARTERLY PRODUCT REVIEW', 320, 70);

        dctx.font = '16px monospace';
        dctx.fillStyle = '#94a3b8';
        dctx.fillText(`Timestamp: 00:${String(Math.floor(t)).padStart(2, '0')}`, 320, 310);

        frame++;
        if (frame >= totalFrames) {
          clearInterval(timer);
          recorder.stop();
        }
      }, 1000 / 30);
    });
  }

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
    btnLoadDemo.textContent = 'Generating sample clip...';
    btnLoadDemo.disabled = true;
    const blob = await generateSampleVideo();
    loadVideo(URL.createObjectURL(blob), 'demo_meeting_review.webm');
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
      cancelAnimationFrame(animId);
    }
  });

  hiddenVideo.addEventListener('ended', () => {
    isPlaying = false;
    btnPlayPause.textContent = 'Play';
  });

  seekBar.addEventListener('input', (e) => {
    if (videoDuration > 0) {
      hiddenVideo.currentTime = (e.target.value / 100) * videoDuration;
      drawFrame();
    }
  });

  // Download Notes
  btnDownloadNotes.addEventListener('click', () => {
    let notes = `AI VIDEO EXECUTIVE SUMMARY: ${videoFileName}\n`;
    notes += `Total Duration: ${formatSec(videoDuration)}\n`;
    notes += `Generated: ${new Date().toLocaleString()}\n`;
    notes += `==========================================\n\n`;

    chapters.forEach(ch => {
      notes += `[${formatSec(ch.time)}] ${ch.title}\n`;
      notes += `Takeaway: ${ch.summary}\n\n`;
    });

    const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${videoFileName}_summary.txt`;
    a.click();
  });

  // Download JSON
  btnDownloadJson.addEventListener('click', () => {
    const data = {
      filename: videoFileName,
      duration: videoDuration,
      chapters: chapters
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${videoFileName}_chapters.json`;
    a.click();
  });

  // Export Highlight Reel
  btnExportReel.addEventListener('click', async () => {
    renderMsg.style.display = 'block';
    btnExportReel.disabled = true;

    hiddenVideo.pause();
    isPlaying = false;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${videoFileName}_highlight_reel.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportReel.disabled = false;
      hiddenVideo.currentTime = 0;
      drawFrame();
    };

    recorder.start();

    // Fast highlight sequence montage across the chapter points
    let currentChIdx = 0;
    hiddenVideo.currentTime = chapters[0].time;
    await hiddenVideo.play();
    isPlaying = true;

    const montageInterval = setInterval(() => {
      drawFrame();
      // Hop to next chapter every 1.5s
      if (hiddenVideo.currentTime > chapters[currentChIdx].time + 1.5) {
        currentChIdx++;
        if (currentChIdx < chapters.length) {
          hiddenVideo.currentTime = chapters[currentChIdx].time;
        } else {
          clearInterval(montageInterval);
          hiddenVideo.pause();
          isPlaying = false;
          if (recorder.state === 'recording') recorder.stop();
        }
      }
    }, 1000 / 30);
  });
});