// Video Merger - Client-Side Multi-Clip Concatenation & Transition Engine
// ALL IN ONE Platform

let clips = [];
let mergedBlob = null;
let isMerging = false;

// DOM
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const workspacePanel = document.getElementById('workspace-panel');

const clipListEl = document.getElementById('clip-list');
const countClips = document.getElementById('count-clips');
const labelTotalDur = document.getElementById('label-total-dur');
const btnAddMore = document.getElementById('btn-add-more');
const btnClearAll = document.getElementById('btn-clear-all');

const mergerCanvas = document.getElementById('merger-canvas');
const previewVideo = document.getElementById('preview-video');
const selectMergeRes = document.getElementById('select-merge-res');
const selectTransition = document.getElementById('select-transition');
const selectMergeFps = document.getElementById('select-merge-fps');

const btnStartMerge = document.getElementById('btn-start-merge');
const progressCard = document.getElementById('progress-card');
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');
const progressStatus = document.getElementById('progress-status');

const resultCard = document.getElementById('result-card');
const resInfo = document.getElementById('res-info');
const btnDownloadMerged = document.getElementById('btn-download-merged');
const btnPlayMerged = document.getElementById('btn-play-merged');

function formatDuration(sec) {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate thumbnail for video
async function generateThumbnail(videoEl) {
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 90;
  const ctx = c.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.7);
}

// Add files to clips array
async function addVideoFiles(files) {
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    await new Promise(resolve => {
      video.onloadeddata = () => {
        video.currentTime = Math.min(0.5, video.duration / 2);
      };
      video.onseeked = () => resolve();
      video.onerror = () => resolve();
    });

    const thumb = await generateThumbnail(video);

    clips.push({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url,
      name: file.name,
      size: file.size,
      duration: video.duration || 0,
      width: video.videoWidth || 1280,
      height: video.videoHeight || 720,
      videoEl: video
    });
  }

  workspacePanel.style.display = 'grid';
  renderClipList();
}

function renderClipList() {
  countClips.textContent = clips.length;
  clipListEl.innerHTML = '';

  let totalDur = 0;
  clips.forEach((clip, idx) => {
    totalDur += clip.duration;

    const card = document.createElement('div');
    card.className = 'clip-card';
    card.innerHTML = `
      <div class="clip-num">#${idx + 1}</div>
      <img src="${clip.thumb}" class="clip-thumb" alt="Thumbnail">
      <div class="clip-info">
        <div class="clip-title" title="${clip.name}">${clip.name}</div>
        <div class="clip-meta">
          <span>${formatDuration(clip.duration)}</span>
          <span>${clip.width}×${clip.height}</span>
          <span>${formatBytes(clip.size)}</span>
        </div>
      </div>
      <div class="clip-actions">
        <button class="clip-btn btn-up" title="Move Up" ${idx === 0 ? 'disabled' : ''}>▲</button>
        <button class="clip-btn btn-down" title="Move Down" ${idx === clips.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="clip-btn danger btn-del" title="Remove Clip">✕</button>
      </div>
    `;

    card.querySelector('.btn-up').addEventListener('click', () => {
      if (idx > 0) {
        const temp = clips[idx];
        clips[idx] = clips[idx - 1];
        clips[idx - 1] = temp;
        renderClipList();
      }
    });

    card.querySelector('.btn-down').addEventListener('click', () => {
      if (idx < clips.length - 1) {
        const temp = clips[idx];
        clips[idx] = clips[idx + 1];
        clips[idx + 1] = temp;
        renderClipList();
      }
    });

    card.querySelector('.btn-del').addEventListener('click', () => {
      clips.splice(idx, 1);
      renderClipList();
    });

    clipListEl.appendChild(card);
  });

  labelTotalDur.textContent = formatDuration(totalDur);

  if (clips.length === 0) {
    workspacePanel.style.display = 'none';
  }
}

// Upload Events
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) addVideoFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', e => {
  if (e.target.files.length > 0) addVideoFiles(e.target.files);
});

btnAddMore.addEventListener('click', () => fileInput.click());
btnClearAll.addEventListener('click', () => {
  clips = [];
  renderClipList();
});

// Demo Generator - creates two 4-second distinct clips
btnLoadDemo.addEventListener('click', async () => {
  btnLoadDemo.disabled = true;
  btnLoadDemo.textContent = 'Generating 2 Clips...';

  async function createClip(title, color1, color2) {
    const c = document.createElement('canvas');
    c.width = 1280;
    c.height = 720;
    const ctx = c.getContext('2d');
    const stream = c.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    const total = 30 * 4;
    let frame = 0;
    rec.start();

    return new Promise(resolve => {
      const int = setInterval(() => {
        frame++;
        const t = frame / 30;
        const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, c.width / 2, c.height / 2 - 20);

        ctx.font = '24px sans-serif';
        ctx.fillText(`Timestamp: ${t.toFixed(1)}s / 4.0s`, c.width / 2, c.height / 2 + 40);

        if (frame >= total) {
          clearInterval(int);
          rec.stop();
        }
      }, 1000 / 30);

      rec.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(new File([blob], `${title.replace(/\s+/g, '_').toLowerCase()}.webm`, { type: 'video/webm' }));
      };
    });
  }

  const file1 = await createClip('Clip 1: Opening Scene', '#1e3a8a', '#0f172a');
  const file2 = await createClip('Clip 2: Highlight Reel', '#831843', '#1e1b4b');

  await addVideoFiles([file1, file2]);

  btnLoadDemo.disabled = false;
  btnLoadDemo.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.4rem;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Load 2 Demo Clips';
});

// Start Merge
btnStartMerge.addEventListener('click', async () => {
  if (clips.length < 2) {
    alert('Please add at least 2 video clips to merge.');
    return;
  }
  if (isMerging) return;
  isMerging = true;

  btnStartMerge.disabled = true;
  progressCard.style.display = 'block';
  resultCard.style.display = 'none';

  // Target Resolution
  let outW = 1280;
  let outH = 720;
  const resChoice = selectMergeRes.value;
  if (resChoice === 'first') {
    outW = clips[0].width;
    outH = clips[0].height;
  } else if (resChoice === '1080p') {
    outW = 1920;
    outH = 1080;
  } else if (resChoice === '720p') {
    outW = 1280;
    outH = 720;
  } else if (resChoice === '480p') {
    outW = 854;
    outH = 480;
  }
  outW = Math.floor(outW / 2) * 2;
  outH = Math.floor(outH / 2) * 2;

  mergerCanvas.width = outW;
  mergerCanvas.height = outH;
  const ctx = mergerCanvas.getContext('2d');

  const fps = parseInt(selectMergeFps.value, 10) || 30;
  const transition = selectTransition.value;
  const stream = mergerCanvas.captureStream(fps);

  let recorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 4000000 });
  } catch (e) {
    recorder = new MediaRecorder(stream);
  }

  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  recorder.onstop = () => {
    isMerging = false;
    btnStartMerge.disabled = false;
    progressCard.style.display = 'none';

    mergedBlob = new Blob(chunks, { type: 'video/webm' });
    resInfo.textContent = `Merged ${clips.length} clips into ${formatDuration(totalRecordedDuration)} (${outW}×${outH}, ${formatBytes(mergedBlob.size)}).`;
    resultCard.style.display = 'block';
  };

  recorder.start(100);

  let totalRecordedDuration = 0;
  const grandTotal = clips.reduce((sum, c) => sum + c.duration, 0);

  // Sequential recording of each clip
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    progressStatus.textContent = `Merging Clip ${i + 1} of ${clips.length}: "${clip.name}"...`;

    const v = clip.videoEl;
    v.currentTime = 0;
    await new Promise(r => { v.onseeked = r; });

    try {
      await v.play();
    } catch (e) {
      v.muted = true;
      await v.play();
    }

    await new Promise(resolve => {
      const drawClip = setInterval(() => {
        if (v.ended || v.currentTime >= clip.duration) {
          clearInterval(drawClip);
          v.pause();
          resolve();
          return;
        }

        // Draw clip centered in target resolution
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, outW, outH);

        const srcRatio = clip.width / clip.height;
        const tgtRatio = outW / outH;
        let dw, dh, dx, dy;
        if (srcRatio > tgtRatio) {
          dw = outW;
          dh = outW / srcRatio;
          dx = 0;
          dy = (outH - dh) / 2;
        } else {
          dh = outH;
          dw = outH * srcRatio;
          dx = (outW - dw) / 2;
          dy = 0;
        }
        ctx.drawImage(v, dx, dy, dw, dh);

        // Transition effect towards end of clip if not last clip
        if (i < clips.length - 1 && transition === 'fade-black') {
          const timeLeft = clip.duration - v.currentTime;
          if (timeLeft < 0.5) {
            const alpha = 1 - (timeLeft / 0.5);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, outW, outH);
          }
        }

        totalRecordedDuration += (1 / fps);
        const overallPct = Math.min(100, Math.round((totalRecordedDuration / grandTotal) * 100));
        progressFill.style.width = `${overallPct}%`;
        progressPct.textContent = `${overallPct}%`;
      }, 1000 / fps);
    });
  }

  if (recorder.state === 'recording') {
    recorder.stop();
  }
});

btnDownloadMerged.addEventListener('click', () => {
  if (!mergedBlob) return;
  const url = URL.createObjectURL(mergedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `merged_${clips.length}_clips.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
});

btnPlayMerged.addEventListener('click', () => {
  if (!mergedBlob) return;
  previewVideo.style.display = 'block';
  mergerCanvas.style.display = 'none';
  previewVideo.src = URL.createObjectURL(mergedBlob);
  previewVideo.play();
});