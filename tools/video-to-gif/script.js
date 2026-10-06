// Video to GIF Converter - Client-Side Animated GIF Studio
// Pure JavaScript Frame Capture, Median-Cut Color Quantization & LZW GIF89a Compiler

let currentVideoUrl = null;
let currentVideoFile = null;
let videoDuration = 0;
let videoNaturalWidth = 640;
let videoNaturalHeight = 360;

// Settings
let selectedFps = 15;
let targetWidth = 320;
let targetHeight = 180;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const btnBrowseFile = document.getElementById('btn-browse-file');
const fileInput = document.getElementById('video-file-input');
const btnDemoVideo = document.getElementById('btn-demo-video');
const studioWorkspace = document.getElementById('studio-workspace');
const btnChangeVideo = document.getElementById('btn-change-video');

const videoFileName = document.getElementById('video-file-name');
const badgeDuration = document.getElementById('badge-duration');
const badgeDimensions = document.getElementById('badge-dimensions');
const badgeSize = document.getElementById('badge-size');

const previewVideo = document.getElementById('preview-video');
const trimStartInput = document.getElementById('trim-start-input');
const trimEndInput = document.getElementById('trim-end-input');
const btnSetStart = document.getElementById('btn-set-start');
const btnSetEnd = document.getElementById('btn-set-end');
const selectedDurationBadge = document.getElementById('selected-duration-badge');

const fpsPills = document.querySelectorAll('.fps-pill-group .pill-btn');
const resPills = document.querySelectorAll('.res-pill-group .pill-btn');
const targetDimensionsReadout = document.getElementById('target-dimensions-readout');

const checkLoopForever = document.getElementById('check-loop-forever');
const checkDither = document.getElementById('check-dither');
const btnConvertGif = document.getElementById('btn-convert-gif');

const encodeProgressCard = document.getElementById('encode-progress-card');
const encodeStatusText = document.getElementById('encode-status-text');
const encodePercentText = document.getElementById('encode-percent-text');
const encodeProgressFill = document.getElementById('encode-progress-fill');

const gifResultCard = document.getElementById('gif-result-card');
const resultGifImg = document.getElementById('result-gif-img');
const gifMetaBadge = document.getElementById('gif-meta-badge');
const btnDownloadGif = document.getElementById('btn-download-gif');

const offscreenCanvas = document.getElementById('offscreen-frame-canvas');
const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

// Format utility
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update Target Dimensions based on aspect ratio
function updateTargetDimensions() {
  const aspect = videoNaturalHeight / (videoNaturalWidth || 1);
  targetHeight = Math.round(targetWidth * aspect);
  // Ensure even dimensions
  if (targetHeight % 2 !== 0) targetHeight += 1;
  targetDimensionsReadout.textContent = `Target Size: ${targetWidth} x ${targetHeight} px`;
}

// Update Trim Duration Badge
function updateTrimDuration() {
  const start = Math.max(0, parseFloat(trimStartInput.value) || 0);
  let end = parseFloat(trimEndInput.value) || 0;
  if (end <= start) {
    end = Math.min(videoDuration, start + 1.0);
    trimEndInput.value = end.toFixed(1);
  }
  const dur = Math.max(0.1, end - start);
  const totalFrames = Math.round(dur * selectedFps);
  selectedDurationBadge.textContent = `Duration: ${dur.toFixed(1)}s (${totalFrames} frames at ${selectedFps} FPS)`;
}

trimStartInput.addEventListener('input', updateTrimDuration);
trimEndInput.addEventListener('input', updateTrimDuration);

btnSetStart.addEventListener('click', () => {
  trimStartInput.value = previewVideo.currentTime.toFixed(1);
  updateTrimDuration();
});

btnSetEnd.addEventListener('click', () => {
  trimEndInput.value = previewVideo.currentTime.toFixed(1);
  updateTrimDuration();
});

// FPS Selectors
fpsPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    fpsPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    selectedFps = parseInt(pill.dataset.fps, 10);
    updateTrimDuration();
  });
});

// Resolution Selectors
resPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    resPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    targetWidth = parseInt(pill.dataset.width, 10);
    updateTargetDimensions();
  });
});

// Load Video File
function loadVideo(file, customUrl = null) {
  if (currentVideoUrl) {
    URL.revokeObjectURL(currentVideoUrl);
  }

  currentVideoFile = file;
  currentVideoUrl = customUrl || URL.createObjectURL(file);
  previewVideo.src = currentVideoUrl;

  previewVideo.onloadedmetadata = () => {
    videoDuration = previewVideo.duration;
    videoNaturalWidth = previewVideo.videoWidth || 640;
    videoNaturalHeight = previewVideo.videoHeight || 360;

    videoFileName.textContent = file ? file.name : 'sample_animation.webm';
    badgeDuration.textContent = `${videoDuration.toFixed(1)}s`;
    badgeDimensions.textContent = `${videoNaturalWidth}x${videoNaturalHeight}`;
    badgeSize.textContent = file ? formatBytes(file.size) : 'Demo';

    trimStartInput.max = videoDuration.toFixed(1);
    trimEndInput.max = videoDuration.toFixed(1);

    trimStartInput.value = '0.0';
    trimEndInput.value = Math.min(videoDuration, 3.0).toFixed(1);

    updateTargetDimensions();
    updateTrimDuration();

    dropZone.style.display = 'none';
    studioWorkspace.style.display = 'flex';
    gifResultCard.style.display = 'none';
  };
}

// Demo Video Generator using HTML5 Canvas & MediaRecorder
async function generateDemoVideo() {
  encodeStatusText.textContent = 'Generating animated canvas video demo...';
  encodeProgressCard.style.display = 'flex';
  encodeProgressFill.style.width = '30%';

  const demoCanvas = document.createElement('canvas');
  demoCanvas.width = 480;
  demoCanvas.height = 360;
  const ctx = demoCanvas.getContext('2d');

  const stream = demoCanvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  const totalFrames = 90; // 3 seconds at 30 fps
  let frame = 0;

  function renderDemoFrame() {
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, 480, 360);

    // Glowing orbiting spheres and ring
    const t = (frame / 30);
    const cx = 240;
    const cy = 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 1.5);

    // Outer gradient ring
    const grad = ctx.createLinearGradient(-100, -100, 100, 100);
    grad.addColorStop(0, '#4e85bf');
    grad.addColorStop(0.5, '#89aacc');
    grad.addColorStop(1, '#10b981');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.stroke();

    // Floating pulsing center orb
    const pulse = 24 + Math.sin(t * 6) * 6;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#4e85bf';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, pulse, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting mini moon
    const moonAngle = t * 4;
    const mx = Math.cos(moonAngle) * 55;
    const my = Math.sin(moonAngle) * 55;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Text watermark
    ctx.fillStyle = '#89aacc';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALL IN ONE • Video to GIF', 240, 330);

    frame++;
    if (frame < totalFrames) {
      requestAnimationFrame(renderDemoFrame);
    } else {
      recorder.stop();
    }
  }

  renderDemoFrame();

  const webmBlob = await new Promise((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
  });

  encodeProgressCard.style.display = 'none';
  loadVideo(new File([webmBlob], 'Orbit_Demo.webm', { type: 'video/webm' }));
}

// ==========================================
// PURE CLIENT-SIDE GIF89a ENCODER
// ==========================================

class ByteArray {
  constructor(initialCapacity = 65536) {
    this.buffer = new Uint8Array(initialCapacity);
    this.length = 0;
  }
  ensure(extra) {
    if (this.length + extra > this.buffer.length) {
      const next = new Uint8Array(Math.max(this.buffer.length * 2, this.length + extra + 65536));
      next.set(this.buffer);
      this.buffer = next;
    }
  }
  writeByte(b) {
    this.ensure(1);
    this.buffer[this.length++] = b & 0xFF;
  }
  writeBytes(arr) {
    this.ensure(arr.length);
    this.buffer.set(arr, this.length);
    this.length += arr.length;
  }
  writeWord(w) {
    this.ensure(2);
    this.buffer[this.length++] = w & 0xFF;
    this.buffer[this.length++] = (w >> 8) & 0xFF;
  }
  writeString(str) {
    this.ensure(str.length);
    for (let i = 0; i < str.length; i++) {
      this.buffer[this.length++] = str.charCodeAt(i) & 0xFF;
    }
  }
  getBytes() {
    return this.buffer.subarray(0, this.length);
  }
}

// Median-Cut Color Palette Builder (Outputs 256 RGB colors)
function buildColorPalette(rgbList, maxColors = 256) {
  // Bounding box cluster
  let boxes = [{
    colors: rgbList,
    rMin: 0, rMax: 255,
    gMin: 0, gMax: 255,
    bMin: 0, bMax: 255
  }];

  function findBounds(box) {
    let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
    const c = box.colors;
    for (let i = 0; i < c.length; i += 3) {
      const r = c[i], g = c[i + 1], b = c[i + 2];
      if (r < rMin) rMin = r;
      if (r > rMax) rMax = r;
      if (g < gMin) gMin = g;
      if (g > gMax) gMax = g;
      if (b < bMin) bMin = b;
      if (b > bMax) bMax = b;
    }
    box.rMin = rMin; box.rMax = rMax;
    box.gMin = gMin; box.gMax = gMax;
    box.bMin = bMin; box.bMax = bMax;
    box.rRange = rMax - rMin;
    box.gRange = gMax - gMin;
    box.bRange = bMax - bMin;
    box.maxRange = Math.max(box.rRange, box.gRange, box.bRange);
  }

  findBounds(boxes[0]);

  // Recursively split box with greatest range
  while (boxes.length < maxColors) {
    let splitIdx = -1;
    let maxR = -1;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].colors.length > 3 && boxes[i].maxRange > maxR) {
        maxR = boxes[i].maxRange;
        splitIdx = i;
      }
    }

    if (splitIdx === -1 || maxR <= 0) break;

    const targetBox = boxes[splitIdx];
    const c = targetBox.colors;

    // Pick channel to sort by
    let channelOffset = 0;
    if (targetBox.gRange >= targetBox.rRange && targetBox.gRange >= targetBox.bRange) {
      channelOffset = 1;
    } else if (targetBox.bRange >= targetBox.rRange && targetBox.bRange >= targetBox.gRange) {
      channelOffset = 2;
    }

    // Sort triples by selected channel
    const numPixels = c.length / 3;
    const indices = new Int32Array(numPixels);
    for (let i = 0; i < numPixels; i++) indices[i] = i * 3;

    indices.sort((a, b) => c[a + channelOffset] - c[b + channelOffset]);

    const half = Math.floor(numPixels / 2);
    const box1Colors = new Uint8Array(half * 3);
    const box2Colors = new Uint8Array((numPixels - half) * 3);

    for (let i = 0; i < half; i++) {
      const idx = indices[i];
      box1Colors[i * 3] = c[idx];
      box1Colors[i * 3 + 1] = c[idx + 1];
      box1Colors[i * 3 + 2] = c[idx + 2];
    }
    for (let i = half; i < numPixels; i++) {
      const idx = indices[i];
      const dst = (i - half) * 3;
      box2Colors[dst] = c[idx];
      box2Colors[dst + 1] = c[idx + 1];
      box2Colors[dst + 2] = c[idx + 2];
    }

    const b1 = { colors: box1Colors };
    const b2 = { colors: box2Colors };
    findBounds(b1);
    findBounds(b2);

    boxes.splice(splitIdx, 1, b1, b2);
  }

  // Compute average color for each box to form 256-color palette
  const palette = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    if (i < boxes.length) {
      const c = boxes[i].colors;
      const count = c.length / 3;
      let rSum = 0, gSum = 0, bSum = 0;
      for (let j = 0; j < c.length; j += 3) {
        rSum += c[j];
        gSum += c[j + 1];
        bSum += c[j + 2];
      }
      palette[i * 3] = Math.round(rSum / count);
      palette[i * 3 + 1] = Math.round(gSum / count);
      palette[i * 3 + 2] = Math.round(bSum / count);
    } else {
      palette[i * 3] = 0;
      palette[i * 3 + 1] = 0;
      palette[i * 3 + 2] = 0;
    }
  }

  return palette;
}

// Fast 15-bit RGB Lookup Table for Palette Indexing
function createPaletteLookupTable(palette) {
  // 32 x 32 x 32 = 32768 entries
  const lut = new Uint8Array(32768);
  for (let r5 = 0; r5 < 32; r5++) {
    const r = (r5 << 3) | 4;
    for (let g5 = 0; g5 < 32; g5++) {
      const g = (g5 << 3) | 4;
      for (let b5 = 0; b5 < 32; b5++) {
        const b = (b5 << 3) | 4;

        let bestDist = Infinity;
        let bestIdx = 0;
        for (let p = 0; p < 256; p++) {
          const pr = palette[p * 3];
          const pg = palette[p * 3 + 1];
          const pb = palette[p * 3 + 2];
          const dr = r - pr;
          const dg = g - pg;
          const db = b - pb;
          const dist = dr * dr + dg * dg + db * db;
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = p;
          }
        }

        const lutIdx = (r5 << 10) | (g5 << 5) | b5;
        lut[lutIdx] = bestIdx;
      }
    }
  }
  return lut;
}

// LZW Stream Encoder
function writeLzwData(bytes, pixelIndices, minCodeSize = 8) {
  const clearCode = 1 << minCodeSize; // 256
  const eoiCode = clearCode + 1; // 257

  let codeSize = minCodeSize + 1;
  let nextCode = clearCode + 2;

  // LZW Dictionary hash table: key = (prefix << 8) | pixel
  const table = new Int32Array(65536).fill(-1);

  // Bit buffer for variable-length codes
  let bitBuf = 0;
  let bitCount = 0;

  // Sub-block buffer (max 255 bytes)
  const blockBuf = new Uint8Array(255);
  let blockLen = 0;

  function flushBlock() {
    if (blockLen > 0) {
      bytes.writeByte(blockLen);
      for (let i = 0; i < blockLen; i++) {
        bytes.writeByte(blockBuf[i]);
      }
      blockLen = 0;
    }
  }

  function emitCode(code) {
    bitBuf |= code << bitCount;
    bitCount += codeSize;

    while (bitCount >= 8) {
      blockBuf[blockLen++] = bitBuf & 0xFF;
      bitBuf >>= 8;
      bitCount -= 8;
      if (blockLen === 255) {
        flushBlock();
      }
    }
  }

  function clearTable() {
    table.fill(-1);
    codeSize = minCodeSize + 1;
    nextCode = clearCode + 2;
  }

  // Output initial Clear Code
  emitCode(clearCode);

  let prefix = pixelIndices[0];

  for (let i = 1; i < pixelIndices.length; i++) {
    const k = pixelIndices[i];
    const hash = ((prefix << 8) | k) & 0xFFFF;
    const existing = table[hash];

    if (existing !== -1) {
      prefix = existing;
    } else {
      emitCode(prefix);

      if (nextCode < 4096) {
        table[hash] = nextCode++;
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        // Dictionary full: reset table
        emitCode(clearCode);
        clearTable();
      }

      prefix = k;
    }
  }

  emitCode(prefix);
  emitCode(eoiCode);

  // Flush remaining bits
  if (bitCount > 0) {
    blockBuf[blockLen++] = bitBuf & 0xFF;
  }
  flushBlock();

  // Block terminator
  bytes.writeByte(0x00);
}

// Convert video frames to Animated GIF Blob
async function compileVideoToGif() {
  const start = Math.max(0, parseFloat(trimStartInput.value) || 0);
  const end = Math.min(videoDuration, parseFloat(trimEndInput.value) || 3.0);
  const dur = Math.max(0.1, end - start);

  const numFrames = Math.max(2, Math.round(dur * selectedFps));
  const frameInterval = dur / numFrames;
  const delayHundredths = Math.max(2, Math.round(100 / selectedFps));

  btnConvertGif.disabled = true;
  encodeProgressCard.style.display = 'flex';
  gifResultCard.style.display = 'none';

  offscreenCanvas.width = targetWidth;
  offscreenCanvas.height = targetHeight;

  const bytes = new ByteArray();

  // 1. Header: 'GIF89a'
  bytes.writeString('GIF89a');

  // 2. Logical Screen Descriptor
  bytes.writeWord(targetWidth);
  bytes.writeWord(targetHeight);
  // Packed: No Global Color Table, 8 bits/pixel
  bytes.writeByte(0x70);
  bytes.writeByte(0x00); // BG color
  bytes.writeByte(0x00); // Aspect ratio

  // 3. Netscape 2.0 Loop Extension
  if (checkLoopForever.checked) {
    bytes.writeByte(0x21); // Extension Introducer
    bytes.writeByte(0xFF); // Application Label
    bytes.writeByte(0x0B); // Block Size
    bytes.writeString('NETSCAPE2.0');
    bytes.writeByte(0x03); // Sub-block length
    bytes.writeByte(0x01);
    bytes.writeWord(0x0000); // Loop count (0 = infinite)
    bytes.writeByte(0x00); // Terminator
  }

  // Pre-sample frames to build adaptive color palette
  encodeStatusText.textContent = 'Sampling video colors for master palette...';
  encodePercentText.textContent = '10%';
  encodeProgressFill.style.width = '10%';

  const samplePixels = [];
  const sampleSteps = Math.min(10, numFrames);

  for (let s = 0; s < sampleSteps; s++) {
    const t = start + (s / sampleSteps) * dur;
    previewVideo.currentTime = t;
    await new Promise((r) => { previewVideo.onseeked = r; });
    offscreenCtx.drawImage(previewVideo, 0, 0, targetWidth, targetHeight);
    const data = offscreenCtx.getImageData(0, 0, targetWidth, targetHeight).data;

    // Subsample pixels
    for (let p = 0; p < data.length; p += 4 * 16) {
      samplePixels.push(data[p], data[p + 1], data[p + 2]);
    }
  }

  const palette = buildColorPalette(new Uint8Array(samplePixels), 256);
  const lut = createPaletteLookupTable(palette);

  // Frame Capture & LZW Encoding Loop
  const pixelCount = targetWidth * targetHeight;
  const indices = new Uint8Array(pixelCount);

  for (let f = 0; f < numFrames; f++) {
    const t = start + f * frameInterval;
    previewVideo.currentTime = t;
    await new Promise((r) => { previewVideo.onseeked = r; });

    offscreenCtx.drawImage(previewVideo, 0, 0, targetWidth, targetHeight);
    const imgData = offscreenCtx.getImageData(0, 0, targetWidth, targetHeight);
    const raw = imgData.data;

    // Color Quantization with fast LUT
    for (let i = 0, p = 0; i < pixelCount; i++, p += 4) {
      const r5 = raw[p] >> 3;
      const g5 = raw[p + 1] >> 3;
      const b5 = raw[p + 2] >> 3;
      const lutIdx = (r5 << 10) | (g5 << 5) | b5;
      indices[i] = lut[lutIdx];
    }

    // 4a. Graphic Control Extension
    bytes.writeByte(0x21); // Introducer
    bytes.writeByte(0xF9); // Label
    bytes.writeByte(0x04); // Block size
    bytes.writeByte(0x08); // Disposal: restore to background (2 << 2)
    bytes.writeWord(delayHundredths); // Delay time
    bytes.writeByte(0x00); // Transparent color
    bytes.writeByte(0x00); // Terminator

    // 4b. Image Descriptor
    bytes.writeByte(0x2C); // Separator
    bytes.writeWord(0); // Left
    bytes.writeWord(0); // Top
    bytes.writeWord(targetWidth);
    bytes.writeWord(targetHeight);
    bytes.writeByte(0x87); // Local Color Table flag, 256 colors

    // 4c. Local Color Table (768 bytes)
    bytes.writeBytes(palette);

    // 4d. LZW Data
    bytes.writeByte(0x08); // LZW minimum code size
    writeLzwData(bytes, indices, 8);

    const pct = Math.round(((f + 1) / numFrames) * 100);
    encodeStatusText.textContent = `Compiling frame ${f + 1} of ${numFrames}...`;
    encodePercentText.textContent = `${pct}%`;
    encodeProgressFill.style.width = `${pct}%`;

    // Yield to UI thread
    if (f % 3 === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  // 5. Trailer
  bytes.writeByte(0x3B);

  const gifBytes = bytes.getBytes();
  const gifBlob = new Blob([gifBytes], { type: 'image/gif' });
  const gifUrl = URL.createObjectURL(gifBlob);

  resultGifImg.src = gifUrl;
  btnDownloadGif.href = gifUrl;
  btnDownloadGif.download = `${(currentVideoFile ? currentVideoFile.name : 'video').replace(/\.[^/.]+$/, '')}_animation.gif`;

  gifMetaBadge.textContent = `${targetWidth}x${targetHeight} • ${numFrames} frames • ${formatBytes(gifBlob.size)}`;
  encodeProgressCard.style.display = 'none';
  gifResultCard.style.display = 'flex';
  btnConvertGif.disabled = false;
}

btnConvertGif.addEventListener('click', compileVideoToGif);

// File Picker and Drag & Drop Events
dropZone.addEventListener('click', (e) => {
  if (e.target !== btnDemoVideo) {
    fileInput.click();
  }
});
btnBrowseFile.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});
btnChangeVideo.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadVideo(file);
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) loadVideo(file);
});

btnDemoVideo.addEventListener('click', (e) => {
  e.stopPropagation();
  generateDemoVideo();
});