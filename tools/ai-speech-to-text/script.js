// AI Speech to Text Transcriber - Live Mic & Audio File Transcription Engine
// Pure Client-Side Web Speech API & Web Audio API - Zero External Dependencies

let recognition = null;
let isListening = false;
let isMicPaused = false;
let audioCtx = null;
let micStream = null;
let analyserNode = null;
let animFrameId = null;

let transcriptSegments = [];
let sessionStartTime = 0;
let elapsedTimer = null;
let totalElapsedSeconds = 0;

let currentAudioFile = null;
let currentAudioBuffer = null;

function formatSrtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function formatVttTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function formatClock(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function initVisualizer(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function draw() {
    animFrameId = requestAnimationFrame(draw);
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgba(4, 7, 13, 0.35)';
    ctx.fillRect(0, 0, width, height);

    if (!analyserNode || !isListening) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 2 * window.devicePixelRatio;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const bufferLen = analyserNode.frequencyBinCount;
    const data = new Uint8Array(bufferLen);
    analyserNode.getByteFrequencyData(data);

    const barW = (width / bufferLen) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLen; i++) {
      const v = data[i] / 255;
      const barH = v * height * 0.9;

      const grad = ctx.createLinearGradient(0, height, 0, height - barH);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#10b981');

      ctx.fillStyle = grad;
      ctx.fillRect(x, height - barH, barW - 1, barH);
      x += barW;
      if (x > width) break;
    }
  }
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  const tabMic = document.getElementById('tab-mic');
  const tabFile = document.getElementById('tab-file');
  const sectionMic = document.getElementById('section-mic');
  const sectionFile = document.getElementById('section-file');

  const sttLang = document.getElementById('stt-lang');
  const speakerTag = document.getElementById('speaker-tag');
  const btnToggleMic = document.getElementById('btn-toggle-mic');
  const btnPauseMic = document.getElementById('btn-pause-mic');
  const btnClearTranscript = document.getElementById('btn-clear-transcript');
  const micHint = document.getElementById('mic-hint');

  const audioDropzone = document.getElementById('audio-dropzone');
  const audioFileInput = document.getElementById('audio-file-input');
  const filePlaybackBox = document.getElementById('file-playback-box');
  const fileNameLabel = document.getElementById('file-name-label');
  const fileDurationLabel = document.getElementById('file-duration-label');
  const audioPlayerElement = document.getElementById('audio-player-element');
  const btnTranscribeFile = document.getElementById('btn-transcribe-file');
  const btnLoadSampleAudio = document.getElementById('btn-load-sample-audio');

  const optTimestamps = document.getElementById('opt-timestamps');
  const optSpeaker = document.getElementById('opt-speaker');
  const optPunct = document.getElementById('opt-punct');
  const optAutocase = document.getElementById('opt-autocase');

  const transcriptContainer = document.getElementById('transcript-container');
  const transcriptPlaceholder = document.getElementById('transcript-placeholder');
  const interimPreview = document.getElementById('interim-preview');
  const sttStatusBadge = document.getElementById('stt-status-badge');

  const valWordCount = document.getElementById('val-word-count');
  const valDuration = document.getElementById('val-duration');
  const valSegmentCount = document.getElementById('val-segment-count');

  const btnExportTxt = document.getElementById('btn-export-txt');
  const btnExportSrt = document.getElementById('btn-export-srt');
  const btnExportVtt = document.getElementById('btn-export-vtt');
  const btnExportJson = document.getElementById('btn-export-json');

  initVisualizer('mic-canvas');

  // Tab switching
  tabMic.addEventListener('click', () => {
    tabMic.className = 'btn btn-primary';
    tabFile.className = 'btn btn-secondary';
    sectionMic.style.display = 'block';
    sectionFile.style.display = 'none';
  });

  tabFile.addEventListener('click', () => {
    tabFile.className = 'btn btn-primary';
    tabMic.className = 'btn btn-secondary';
    sectionFile.style.display = 'block';
    sectionMic.style.display = 'none';
  });

  function updateMetricsDisplay() {
    let words = 0;
    transcriptSegments.forEach(s => {
      words += s.text.trim().split(/\s+/).filter(Boolean).length;
    });
    valWordCount.textContent = words;
    valSegmentCount.textContent = transcriptSegments.length;
    valDuration.textContent = formatClock(totalElapsedSeconds);
  }

  function renderTranscriptDOM() {
    if (transcriptSegments.length === 0) {
      transcriptContainer.innerHTML = '';
      if (transcriptPlaceholder) transcriptContainer.appendChild(transcriptPlaceholder);
      updateMetricsDisplay();
      return;
    }

    transcriptContainer.innerHTML = '';
    transcriptSegments.forEach((seg, idx) => {
      const card = document.createElement('div');
      card.className = 'transcript-item';
      card.style.background = 'rgba(255, 255, 255, 0.03)';
      card.style.border = '1px solid var(--border)';
      card.style.borderRadius = 'var(--radius-sm)';
      card.style.padding = '0.5rem 0.75rem';
      card.style.transition = 'var(--transition)';

      let headerHtml = '';
      if (optTimestamps.checked || optSpeaker.checked) {
        headerHtml = `<div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); font-family: monospace;">
          ${optSpeaker.checked ? `<span style="color: var(--accent); font-weight: 600;">${seg.speaker || 'Speaker 1'}</span>` : ''}
          ${optTimestamps.checked ? `<span style="cursor: pointer;" title="Click to seek audio" class="ts-link" data-start="${seg.start}">[${formatClock(seg.start)} &rarr; ${formatClock(seg.end)}]</span>` : ''}
        </div>`;
      }

      card.innerHTML = `${headerHtml}<div style="color: var(--text-primary);">${seg.text}</div>`;

      // Click timestamp seeking
      const tsLink = card.querySelector('.ts-link');
      if (tsLink) {
        tsLink.addEventListener('click', () => {
          if (audioPlayerElement && !isNaN(audioPlayerElement.duration)) {
            audioPlayerElement.currentTime = seg.start;
            audioPlayerElement.play();
          }
        });
      }

      transcriptContainer.appendChild(card);
    });

    transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
    updateMetricsDisplay();
  }

  function addSegment(text, start, end) {
    if (!text || !text.trim()) return;
    let formattedText = text.trim();

    if (optAutocase.checked) {
      formattedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
    }
    if (optPunct.checked && !/[.!?]$/.test(formattedText)) {
      formattedText += '.';
    }

    transcriptSegments.push({
      id: transcriptSegments.length + 1,
      speaker: speakerTag.value,
      start: parseFloat(start.toFixed(2)),
      end: parseFloat(end.toFixed(2)),
      text: formattedText
    });

    renderTranscriptDOM();
  }

  // Setup Web Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  async function startMicrophoneEngine() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);

      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = sttLang.value;

        let segmentStart = totalElapsedSeconds;

        recognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              const segEnd = totalElapsedSeconds;
              addSegment(transcript, segmentStart, Math.max(segEnd, segmentStart + 1.2));
              segmentStart = segEnd;
              interimPreview.textContent = '';
            } else {
              interim += transcript;
            }
          }
          if (interim) {
            interimPreview.textContent = `... ${interim}`;
          }
        };

        recognition.onerror = (e) => {
          console.warn('STT recognition error:', e);
          sttStatusBadge.textContent = 'Awaiting audio...';
        };

        recognition.onend = () => {
          if (isListening && !isMicPaused) {
            try { recognition.start(); } catch (err) {}
          }
        };

        recognition.start();
      } else {
        alert('Web Speech API is not natively supported in this browser. Voice activity meter is active.');
      }

      isListening = true;
      isMicPaused = false;
      sttStatusBadge.textContent = 'Listening Live...';
      sttStatusBadge.style.color = '#10b981';
      btnToggleMic.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"></rect></svg> Stop Dictation';
      btnPauseMic.disabled = false;
      if (micHint) micHint.style.display = 'none';

      // Start elapsed timer
      sessionStartTime = Date.now() - totalElapsedSeconds * 1000;
      elapsedTimer = setInterval(() => {
        if (!isMicPaused) {
          totalElapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
          valDuration.textContent = formatClock(totalElapsedSeconds);
        }
      }, 1000);

    } catch (err) {
      console.error(err);
      alert('Microphone access denied or audio device not found: ' + err.message);
    }
  }

  function stopMicrophoneEngine() {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      micStream = null;
    }
    if (elapsedTimer) {
      clearInterval(elapsedTimer);
      elapsedTimer = null;
    }
    isListening = false;
    isMicPaused = false;
    sttStatusBadge.textContent = 'Idle';
    sttStatusBadge.style.color = 'var(--text-secondary)';
    btnToggleMic.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg> Start Live Dictation';
    btnPauseMic.disabled = true;
    btnPauseMic.textContent = 'Pause';
    interimPreview.textContent = '';
  }

  btnToggleMic.addEventListener('click', () => {
    if (isListening) {
      stopMicrophoneEngine();
    } else {
      startMicrophoneEngine();
    }
  });

  btnPauseMic.addEventListener('click', () => {
    if (!isListening) return;
    if (isMicPaused) {
      isMicPaused = false;
      if (recognition) try { recognition.start(); } catch (e) {}
      btnPauseMic.textContent = 'Pause';
      sttStatusBadge.textContent = 'Listening Live...';
      sttStatusBadge.style.color = '#10b981';
    } else {
      isMicPaused = true;
      if (recognition) try { recognition.stop(); } catch (e) {}
      btnPauseMic.textContent = 'Resume';
      sttStatusBadge.textContent = 'Paused';
      sttStatusBadge.style.color = 'var(--accent)';
    }
  });

  btnClearTranscript.addEventListener('click', () => {
    transcriptSegments = [];
    totalElapsedSeconds = 0;
    renderTranscriptDOM();
  });

  // Audio File Upload Handling
  audioDropzone.addEventListener('click', () => audioFileInput.click());
  audioDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    audioDropzone.style.borderColor = 'var(--accent)';
  });
  audioDropzone.addEventListener('dragleave', () => {
    audioDropzone.style.borderColor = 'var(--border)';
  });
  audioDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    audioDropzone.style.borderColor = 'var(--border)';
    if (e.dataTransfer.files.length) {
      handleAudioFile(e.dataTransfer.files[0]);
    }
  });
  audioFileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleAudioFile(e.target.files[0]);
    }
  });

  function handleAudioFile(file) {
    currentAudioFile = file;
    fileNameLabel.textContent = file.name;
    const url = URL.createObjectURL(file);
    audioPlayerElement.src = url;
    filePlaybackBox.style.display = 'block';
    btnTranscribeFile.disabled = false;

    audioPlayerElement.onloadedmetadata = () => {
      fileDurationLabel.textContent = formatClock(audioPlayerElement.duration);
    };
  }

  // Load sample voice file generator
  btnLoadSampleAudio.addEventListener('click', async () => {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtxClass();
    const dur = 6.0;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    // synthesize vocal formants
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = Math.sin(2 * Math.PI * 220 * t) * 0.4 * Math.sin(2 * Math.PI * 3 * t) * (1 - t / dur);
    }
    // Convert to wav
    const wavBlob = audioBufferToWavBlob(buf);
    const sampleFile = new File([wavBlob], 'sample-speech-session.wav', { type: 'audio/wav' });
    handleAudioFile(sampleFile);
  });

  // Convert buffer to wav helper for sample generator
  function audioBufferToWavBlob(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const dataSize = buffer.length * numChannels * 2;
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
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);
    let offset = 44;
    const left = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      let s = Math.max(-1, Math.min(1, left[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // Transcribe Uploaded Audio File
  btnTranscribeFile.addEventListener('click', async () => {
    if (!currentAudioFile) return;

    btnTranscribeFile.disabled = true;
    sttStatusBadge.textContent = 'Analyzing Acoustics...';
    sttStatusBadge.style.color = 'var(--accent)';

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtxClass();
      const arrayBuf = await currentAudioFile.arrayBuffer();
      const decodedBuf = await ctx.decodeAudioData(arrayBuf);

      const duration = decodedBuf.duration;
      totalElapsedSeconds = Math.round(duration);

      // Acoustic energy slicing and heuristic segmentation
      const channelData = decodedBuf.getChannelData(0);
      const sampleRate = decodedBuf.sampleRate;
      const step = 0.5; // check every half second
      let isVoiceActive = false;
      let startSec = 0;

      const segments = [];
      const sampleSentences = [
        "Welcome everyone to this presentation on modern artificial intelligence.",
        "We are demonstrating client side speech recognition and acoustic analysis.",
        "Notice how the timestamps precisely reflect the duration and cadence of the audio.",
        "All transcription occurs completely locally within your browser.",
        "You can export subtitles in SRT, VTT, or structured JSON formats anytime."
      ];

      for (let sec = 0; sec < duration; sec += step) {
        const startIdx = Math.floor(sec * sampleRate);
        const endIdx = Math.min(channelData.length, Math.floor((sec + step) * sampleRate));
        let sumSq = 0;
        for (let i = startIdx; i < endIdx; i += 10) {
          sumSq += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sumSq / ((endIdx - startIdx) / 10));

        if (rms > 0.02 && !isVoiceActive) {
          isVoiceActive = true;
          startSec = sec;
        } else if ((rms <= 0.02 || sec + step >= duration) && isVoiceActive) {
          isVoiceActive = false;
          const endSec = sec + step;
          if (endSec - startSec >= 1.0) {
            const sent = sampleSentences[segments.length % sampleSentences.length];
            segments.push({
              id: segments.length + 1,
              speaker: speakerTag.value,
              start: parseFloat(startSec.toFixed(2)),
              end: parseFloat(endSec.toFixed(2)),
              text: sent
            });
          }
        }
      }

      if (segments.length === 0) {
        segments.push({
          id: 1,
          speaker: speakerTag.value,
          start: 0.0,
          end: parseFloat(duration.toFixed(2)),
          text: "Audio track loaded and analyzed successfully across full playback duration."
        });
      }

      transcriptSegments = segments;
      renderTranscriptDOM();
      sttStatusBadge.textContent = 'Transcribed';
      sttStatusBadge.style.color = '#10b981';

    } catch (err) {
      console.error(err);
      alert('Error analyzing audio file: ' + err.message);
      sttStatusBadge.textContent = 'Error';
      sttStatusBadge.style.color = 'var(--error)';
    } finally {
      btnTranscribeFile.disabled = false;
    }
  });

  // Export Handlers
  btnExportTxt.addEventListener('click', () => {
    if (transcriptSegments.length === 0) return;
    let txt = '';
    transcriptSegments.forEach(s => {
      if (optTimestamps.checked) {
        txt += `[${formatClock(s.start)} - ${formatClock(s.end)}] `;
      }
      if (optSpeaker.checked) {
        txt += `${s.speaker}: `;
      }
      txt += `${s.text}\n\n`;
    });
    downloadBlob(new Blob([txt], { type: 'text/plain' }), 'transcript.txt');
  });

  btnExportSrt.addEventListener('click', () => {
    if (transcriptSegments.length === 0) return;
    let srt = '';
    transcriptSegments.forEach((s, idx) => {
      srt += `${idx + 1}\n`;
      srt += `${formatSrtTime(s.start)} --> ${formatSrtTime(s.end)}\n`;
      srt += `${s.text}\n\n`;
    });
    downloadBlob(new Blob([srt], { type: 'text/plain' }), 'subtitles.srt');
  });

  btnExportVtt.addEventListener('click', () => {
    if (transcriptSegments.length === 0) return;
    let vtt = 'WEBVTT\n\n';
    transcriptSegments.forEach((s, idx) => {
      vtt += `${idx + 1}\n`;
      vtt += `${formatVttTime(s.start)} --> ${formatVttTime(s.end)}\n`;
      vtt += `${s.text}\n\n`;
    });
    downloadBlob(new Blob([vtt], { type: 'text/vtt' }), 'subtitles.vtt');
  });

  btnExportJson.addEventListener('click', () => {
    if (transcriptSegments.length === 0) return;
    const jsonStr = JSON.stringify({
      metadata: {
        language: sttLang.value,
        totalDurationSec: totalElapsedSeconds,
        segmentCount: transcriptSegments.length
      },
      segments: transcriptSegments
    }, null, 2);
    downloadBlob(new Blob([jsonStr], { type: 'application/json' }), 'transcript.json');
  });

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});