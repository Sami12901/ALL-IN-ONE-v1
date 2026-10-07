// Add Audio to Video - 100% Client-Side Mixer & Synthesizer
document.addEventListener('DOMContentLoaded', () => {
  let videoBlobUrl = null;
  let audioBlobUrl = null;
  let videoName = 'video_mix';
  let videoDuration = 0;
  let audioCtx = null;
  let isMerging = false;

  const setupSection = document.getElementById('setup-section');
  const studioSection = document.getElementById('studio-section');

  const videoFileInput = document.getElementById('video-file-input');
  const audioFileInput = document.getElementById('audio-file-input');
  const btnBrowseVideo = document.getElementById('btn-browse-video');
  const btnDemoVideo = document.getElementById('btn-demo-video');
  const btnBrowseAudio = document.getElementById('btn-browse-audio');
  const btnGenAudio = document.getElementById('btn-gen-audio');
  const videoNameLabel = document.getElementById('video-name-label');
  const audioNameLabel = document.getElementById('audio-name-label');
  const btnOpenMixer = document.getElementById('btn-open-mixer');

  const stageVideo = document.getElementById('stage-video');
  const bgAudio = document.getElementById('bg-audio');
  const exportCanvas = document.getElementById('export-canvas');
  const ctx = exportCanvas.getContext('2d');

  const btnMixerPlay = document.getElementById('btn-mixer-play');
  const mixerSeek = document.getElementById('mixer-seek');
  const mixerTime = document.getElementById('mixer-time');

  const sliderVolVideo = document.getElementById('slider-vol-video');
  const sliderVolMusic = document.getElementById('slider-vol-music');
  const volVideoVal = document.getElementById('vol-video-val');
  const volMusicVal = document.getElementById('vol-music-val');
  const checkLoopAudio = document.getElementById('check-loop-audio');

  const presetChips = document.querySelectorAll('.preset-chip');
  const btnRenderMix = document.getElementById('btn-render-mix');
  const mixProgress = document.getElementById('mix-progress');

  function initAudioCtx() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function formatSec(s) {
    if (isNaN(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function checkReadiness() {
    if (videoBlobUrl && audioBlobUrl) {
      btnOpenMixer.disabled = false;
    }
  }

  // Synthesize procedural soundtrack with Web Audio
  function synthesizeSoundtrack(style = 'ambient') {
    initAudioCtx();
    const rate = 44100;
    const duration = 10.0;
    const buffer = audioCtx.createBuffer(2, rate * duration, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let baseFreqs = [196, 246.94, 293.66, 392]; // G major
    if (style === 'cinematic') baseFreqs = [130.81, 164.81, 196, 261.63]; // C minor
    if (style === 'upbeat') baseFreqs = [220, 277.18, 329.63, 440]; // A major
    if (style === 'zen') baseFreqs = [174.61, 220, 261.63, 349.23]; // F major

    for (let i = 0; i < buffer.length; i++) {
      const t = i / rate;
      let sample = 0;
      baseFreqs.forEach((freq, idx) => {
        const pulse = 1 + 0.3 * Math.sin(t * (idx + 1) * 0.8);
        sample += Math.sin(2 * Math.PI * freq * t) * (0.15 / baseFreqs.length) * pulse;
      });

      // Add gentle percussion or pulse
      if (style === 'upbeat') {
        const beat = (t * 2) % 1;
        sample += Math.exp(-beat * 15) * 0.15 * Math.sin(2 * Math.PI * 80 * beat);
      }

      left[i] = sample;
      right[i] = sample * (0.85 + 0.15 * Math.sin(t * 2));
    }

    // Convert to WAV Blob
    return encodeWav(buffer);
  }

  function encodeWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const totalSamples = buffer.length * numChannels;
    const dataSize = totalSamples * 2;
    const arrayBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(arrayBuffer);

    function writeStr(offset, str) {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < buffer.length; i++) {
      let l = Math.max(-1, Math.min(1, left[i]));
      let r = Math.max(-1, Math.min(1, right[i]));
      view.setInt16(offset, l < 0 ? l * 0x8000 : l * 0x7FFF, true);
      offset += 2;
      view.setInt16(offset, r < 0 ? r * 0x8000 : r * 0x7FFF, true);
      offset += 2;
    }
    return new Blob([view], { type: 'audio/wav' });
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
      const totalFrames = 30 * 8; // 8s

      const timer = setInterval(() => {
        const t = frame / 30;
        dctx.fillStyle = '#0a0f1d';
        dctx.fillRect(0, 0, 640, 360);

        // Visual bars
        for (let i = 0; i < 20; i++) {
          const bh = 50 + Math.sin(t * 4 + i) * 40;
          dctx.fillStyle = `hsl(${200 + i * 5}, 70%, 55%)`;
          dctx.fillRect(50 + i * 27, 260 - bh, 20, bh);
        }

        dctx.fillStyle = '#ffffff';
        dctx.font = 'bold 22px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('SAMPLE MOTION CLIP', 320, 80);

        frame++;
        if (frame >= totalFrames) {
          clearInterval(timer);
          recorder.stop();
        }
      }, 1000 / 30);
    });
  }

  // Event handlers for picker
  btnBrowseVideo.addEventListener('click', () => videoFileInput.click());
  videoFileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      videoName = file.name.replace(/\.[^/.]+$/, '');
      videoBlobUrl = URL.createObjectURL(file);
      videoNameLabel.textContent = file.name;
      checkReadiness();
    }
  });

  btnDemoVideo.addEventListener('click', async () => {
    btnDemoVideo.textContent = 'Generating...';
    const blob = await generateSampleVideo();
    videoBlobUrl = URL.createObjectURL(blob);
    videoName = 'sample_motion_clip';
    videoNameLabel.textContent = 'sample_motion_clip.webm';
    btnDemoVideo.textContent = 'Use Sample Video';
    checkReadiness();
  });

  btnBrowseAudio.addEventListener('click', () => audioFileInput.click());
  audioFileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      audioBlobUrl = URL.createObjectURL(file);
      audioNameLabel.textContent = file.name;
      checkReadiness();
    }
  });

  btnGenAudio.addEventListener('click', () => {
    const wavBlob = synthesizeSoundtrack('ambient');
    audioBlobUrl = URL.createObjectURL(wavBlob);
    audioNameLabel.textContent = 'Ambient Chill (Synthesized)';
    checkReadiness();
  });

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const style = chip.dataset.preset;
      const wavBlob = synthesizeSoundtrack(style);
      audioBlobUrl = URL.createObjectURL(wavBlob);
      bgAudio.src = audioBlobUrl;
      audioNameLabel.textContent = `${chip.textContent} (Synthesized)`;
    });
  });

  btnOpenMixer.addEventListener('click', () => {
    setupSection.style.display = 'none';
    studioSection.style.display = 'grid';

    stageVideo.src = videoBlobUrl;
    bgAudio.src = audioBlobUrl;

    stageVideo.onloadedmetadata = () => {
      videoDuration = stageVideo.duration;
      exportCanvas.width = stageVideo.videoWidth || 640;
      exportCanvas.height = stageVideo.videoHeight || 360;
      mixerTime.textContent = `00:00 / ${formatSec(videoDuration)}`;
    };

    stageVideo.volume = parseFloat(sliderVolVideo.value);
    bgAudio.volume = parseFloat(sliderVolMusic.value);
    bgAudio.loop = checkLoopAudio.checked;
  });

  // Playback sync
  btnMixerPlay.addEventListener('click', () => {
    initAudioCtx();
    if (stageVideo.paused) {
      stageVideo.play();
      bgAudio.play();
      btnMixerPlay.textContent = 'Pause Both';
    } else {
      stageVideo.pause();
      bgAudio.pause();
      btnMixerPlay.textContent = 'Play Both';
    }
  });

  stageVideo.addEventListener('timeupdate', () => {
    if (!mixerSeek.matches(':active') && videoDuration > 0) {
      mixerSeek.value = (stageVideo.currentTime / videoDuration) * 100;
    }
    mixerTime.textContent = `${formatSec(stageVideo.currentTime)} / ${formatSec(videoDuration)}`;
  });

  stageVideo.addEventListener('ended', () => {
    bgAudio.pause();
    btnMixerPlay.textContent = 'Play Both';
  });

  mixerSeek.addEventListener('input', (e) => {
    if (videoDuration > 0) {
      const targetTime = (e.target.value / 100) * videoDuration;
      stageVideo.currentTime = targetTime;
      bgAudio.currentTime = targetTime % (bgAudio.duration || targetTime || 1);
    }
  });

  sliderVolVideo.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    stageVideo.volume = val;
    volVideoVal.textContent = `${Math.round(val * 100)}%`;
  });

  sliderVolMusic.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    bgAudio.volume = val;
    volMusicVal.textContent = `${Math.round(val * 100)}%`;
  });

  checkLoopAudio.addEventListener('change', () => {
    bgAudio.loop = checkLoopAudio.checked;
  });

  // Export Combined Video & Audio using Web Audio & Canvas Capture
  btnRenderMix.addEventListener('click', async () => {
    if (isMerging) return;
    isMerging = true;
    btnRenderMix.disabled = true;
    mixProgress.style.display = 'block';

    initAudioCtx();
    stageVideo.pause();
    bgAudio.pause();
    stageVideo.currentTime = 0;
    bgAudio.currentTime = 0;

    exportCanvas.width = stageVideo.videoWidth || 640;
    exportCanvas.height = stageVideo.videoHeight || 360;

    const stream = exportCanvas.captureStream(30);

    // Combine audio tracks into MediaStreamDestination
    const mediaDest = audioCtx.createMediaStreamDestination();

    try {
      const videoSource = audioCtx.createMediaElementSource(stageVideo);
      const videoGain = audioCtx.createGain();
      videoGain.gain.value = parseFloat(sliderVolVideo.value);
      videoSource.connect(videoGain);
      videoGain.connect(mediaDest);
    } catch (e) {
      /* in case already connected or cross-origin */
    }

    try {
      const audioSource = audioCtx.createMediaElementSource(bgAudio);
      const audioGain = audioCtx.createGain();
      audioGain.gain.value = parseFloat(sliderVolMusic.value);
      audioSource.connect(audioGain);
      audioGain.connect(mediaDest);
    } catch (e) {
      /* in case already connected */
    }

    mediaDest.stream.getAudioTracks().forEach(track => {
      stream.addTrack(track);
    });

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const mergedBlob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(mergedBlob);
      a.download = `${videoName}_with_music.webm`;
      a.click();

      mixProgress.style.display = 'none';
      btnRenderMix.disabled = false;
      isMerging = false;
      btnMixerPlay.textContent = 'Play Both';
    };

    recorder.start();
    await stageVideo.play();
    await bgAudio.play();

    const drawLoop = setInterval(() => {
      ctx.drawImage(stageVideo, 0, 0, exportCanvas.width, exportCanvas.height);
      if (stageVideo.ended || stageVideo.currentTime >= videoDuration) {
        clearInterval(drawLoop);
        stageVideo.pause();
        bgAudio.pause();
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / 30);
  });
});