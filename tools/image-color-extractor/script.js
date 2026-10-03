// Image Color Palette Extractor Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const browseBtn = document.getElementById('browse-btn');
  const fileInput = document.getElementById('file-input');
  const previewWrapper = document.getElementById('preview-wrapper');
  const canvasContainer = document.getElementById('canvas-container');
  const imageCanvas = document.getElementById('image-canvas');
  const canvasLoupe = document.getElementById('canvas-loupe');
  const imageMeta = document.getElementById('image-meta');
  const eyedropperPreview = document.getElementById('eyedropper-preview');
  const eyedropperSwatch = document.getElementById('eyedropper-swatch');
  const eyedropperHex = document.getElementById('eyedropper-hex');

  const swatchCountSelect = document.getElementById('swatch-count-select');
  const algorithmSelect = document.getElementById('algorithm-select');
  const sortSelect = document.getElementById('sort-select');
  const filterExtremes = document.getElementById('filter-extremes');

  const resultsArea = document.getElementById('results-area');
  const emptyState = document.getElementById('empty-state');
  const paletteRibbon = document.getElementById('palette-ribbon');
  const swatchCardsContainer = document.getElementById('swatch-cards-container');
  const totalSamplesCount = document.getElementById('total-samples-count');

  const btnCopyCss = document.getElementById('btn-copy-css');
  const btnCopyTailwind = document.getElementById('btn-copy-tailwind');
  const btnCopyHex = document.getElementById('btn-copy-hex');
  const btnDownloadPalette = document.getElementById('btn-download-palette');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // State
  let currentImage = null;
  let extractedPalette = [];
  let toastTimer = null;

  // Show Toast
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Copy to clipboard helper
  async function copyText(text, label = 'Copied to clipboard!') {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast(label);
    } catch (e) {
      console.error('Copy failed:', e);
      showToast('Failed to copy: ' + e.message);
    }
  }

  // Color Math & Conversions
  function rgbToHex(r, g, b) {
    const toHex = (n) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastColor(r, g, b) {
    return getLuminance(r, g, b) > 0.35 ? '#0f172a' : '#ffffff';
  }

  // --- Median Cut Quantization ---
  function medianCutQuantize(pixels, targetCount) {
    if (pixels.length === 0) return [];
    if (pixels.length <= targetCount) {
      return pixels.map(p => ({
        r: p.r, g: p.g, b: p.b,
        count: 1,
        share: 1 / pixels.length
      }));
    }

    class VBox {
      constructor(pxs) {
        this.pixels = pxs;
        this.rMin = 255; this.rMax = 0;
        this.gMin = 255; this.gMax = 0;
        this.bMin = 255; this.bMax = 0;
        for (let i = 0; i < pxs.length; i++) {
          const p = pxs[i];
          if (p.r < this.rMin) this.rMin = p.r;
          if (p.r > this.rMax) this.rMax = p.r;
          if (p.g < this.gMin) this.gMin = p.g;
          if (p.g > this.gMax) this.gMax = p.g;
          if (p.b < this.bMin) this.bMin = p.b;
          if (p.b > this.bMax) this.bMax = p.b;
        }
      }

      volume() {
        return (this.rMax - this.rMin + 1) * (this.gMax - this.gMin + 1) * (this.bMax - this.bMin + 1);
      }

      count() {
        return this.pixels.length;
      }

      maxRangeDim() {
        const rDiff = this.rMax - this.rMin;
        const gDiff = this.gMax - this.gMin;
        const bDiff = this.bMax - this.bMin;
        if (rDiff >= gDiff && rDiff >= bDiff) return 'r';
        if (gDiff >= rDiff && gDiff >= bDiff) return 'g';
        return 'b';
      }

      avg() {
        let rSum = 0, gSum = 0, bSum = 0;
        const len = this.pixels.length;
        for (let i = 0; i < len; i++) {
          rSum += this.pixels[i].r;
          gSum += this.pixels[i].g;
          bSum += this.pixels[i].b;
        }
        return {
          r: Math.round(rSum / len),
          g: Math.round(gSum / len),
          b: Math.round(bSum / len),
          count: len
        };
      }
    }

    const boxes = [new VBox(pixels)];

    while (boxes.length < targetCount) {
      // Find box with highest pixel count (or volume * count) that can be split
      let bestIndex = -1;
      let maxScore = -1;

      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i];
        if (b.pixels.length >= 2) {
          const score = b.count();
          if (score > maxScore) {
            maxScore = score;
            bestIndex = i;
          }
        }
      }

      if (bestIndex === -1) break;

      const boxToSplit = boxes.splice(bestIndex, 1)[0];
      const dim = boxToSplit.maxRangeDim();

      // Sort pixels along max range dimension
      boxToSplit.pixels.sort((a, b) => a[dim] - b[dim]);

      const medianIdx = Math.floor(boxToSplit.pixels.length / 2);
      const leftPxs = boxToSplit.pixels.slice(0, medianIdx);
      const rightPxs = boxToSplit.pixels.slice(medianIdx);

      if (leftPxs.length > 0) boxes.push(new VBox(leftPxs));
      if (rightPxs.length > 0) boxes.push(new VBox(rightPxs));
    }

    const totalCount = pixels.length;
    return boxes.map(b => {
      const avg = b.avg();
      return {
        r: avg.r,
        g: avg.g,
        b: avg.b,
        count: avg.count,
        share: avg.count / totalCount
      };
    });
  }

  // --- K-Means Quantization ---
  function kMeansQuantize(pixels, k, maxIter = 12) {
    if (pixels.length === 0) return [];
    if (pixels.length <= k) {
      return pixels.map(p => ({ ...p, count: 1, share: 1 / pixels.length }));
    }

    // Seed centroids with Median Cut for rapid convergence
    const seedBox = medianCutQuantize(pixels, k);
    let centroids = seedBox.map(c => ({ r: c.r, g: c.g, b: c.b }));

    // Fallback if median cut produced fewer
    while (centroids.length < k) {
      const randomPx = pixels[Math.floor(Math.random() * pixels.length)];
      centroids.push({ r: randomPx.r, g: randomPx.g, b: randomPx.b });
    }

    let clusters = Array.from({ length: k }, () => []);

    for (let iter = 0; iter < maxIter; iter++) {
      clusters = Array.from({ length: k }, () => []);

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];
        let minDist = Infinity;
        let bestC = 0;

        for (let c = 0; c < k; c++) {
          const cent = centroids[c];
          // Euclidean distance in RGB
          const dr = p.r - cent.r;
          const dg = p.g - cent.g;
          const db = p.b - cent.b;
          const dist = dr * dr + dg * dg + db * db;
          if (dist < minDist) {
            minDist = dist;
            bestC = c;
          }
        }

        clusters[bestC].push(p);
      }

      let maxShift = 0;
      for (let c = 0; c < k; c++) {
        const cluster = clusters[c];
        if (cluster.length === 0) continue;

        let rSum = 0, gSum = 0, bSum = 0;
        for (let j = 0; j < cluster.length; j++) {
          rSum += cluster[j].r;
          gSum += cluster[j].g;
          bSum += cluster[j].b;
        }

        const newR = Math.round(rSum / cluster.length);
        const newG = Math.round(gSum / cluster.length);
        const newB = Math.round(bSum / cluster.length);

        const shift = Math.abs(centroids[c].r - newR) + Math.abs(centroids[c].g - newG) + Math.abs(centroids[c].b - newB);
        if (shift > maxShift) maxShift = shift;

        centroids[c] = { r: newR, g: newG, b: newB };
      }

      if (maxShift < 2) break;
    }

    const totalCount = pixels.length;
    const result = [];
    for (let c = 0; c < k; c++) {
      const cluster = clusters[c];
      if (cluster.length > 0) {
        result.push({
          r: centroids[c].r,
          g: centroids[c].g,
          b: centroids[c].b,
          count: cluster.length,
          share: cluster.length / totalCount
        });
      }
    }
    return result;
  }

  // --- Vibrant Accent Quantization ---
  function vibrantQuantize(pixels, targetCount) {
    if (pixels.length === 0) return [];
    
    // Compute saturation and lightness for each pixel, score vibrancy
    const scoredPixels = [];
    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      const hsl = rgbToHsl(p.r, p.g, p.b);
      // Vibrancy score favors saturated non-extreme colors
      const vibrancy = (hsl.s / 100) * (1 - Math.abs(hsl.l - 50) / 50);
      scoredPixels.push({ ...p, hsl, vibrancy });
    }

    // Sort by vibrancy descending
    scoredPixels.sort((a, b) => b.vibrancy - a.vibrancy);

    // Pick distinct clusters
    const picks = [];
    const minColorDistance = 55; // RGB Euclidean distance threshold

    for (let i = 0; i < scoredPixels.length; i++) {
      const candidate = scoredPixels[i];
      let tooClose = false;

      for (let j = 0; j < picks.length; j++) {
        const p = picks[j];
        const dist = Math.hypot(candidate.r - p.r, candidate.g - p.g, candidate.b - p.b);
        if (dist < minColorDistance) {
          tooClose = true;
          picks[j].count = (picks[j].count || 1) + 1;
          break;
        }
      }

      if (!tooClose) {
        picks.push({
          r: candidate.r,
          g: candidate.g,
          b: candidate.b,
          count: 1
        });
        if (picks.length >= targetCount) break;
      }
    }

    // If we didn't fill targetCount, fill with median cut
    if (picks.length < targetCount) {
      const base = medianCutQuantize(pixels, targetCount);
      for (const b of base) {
        if (!picks.some(p => Math.hypot(p.r - b.r, p.g - b.g, p.b - b.b) < 30)) {
          picks.push(b);
          if (picks.length >= targetCount) break;
        }
      }
    }

    const totalCount = picks.reduce((acc, p) => acc + (p.count || 1), 0);
    return picks.map(p => ({
      r: p.r,
      g: p.g,
      b: p.b,
      count: p.count || 1,
      share: (p.count || 1) / totalCount
    }));
  }

  // --- Extract Palette from Current Image ---
  function processImagePalette() {
    if (!currentImage) return;

    const count = parseInt(swatchCountSelect.value, 10) || 8;
    const algo = algorithmSelect.value;
    const sortBy = sortSelect.value;
    const shouldFilterExtremes = filterExtremes.checked;

    // Off-screen canvas for sampling
    const offCanvas = document.createElement('canvas');
    // Scale image down to max dimension 250px for fast sampling while retaining detail
    const maxSampleDim = 250;
    let sampleW = currentImage.naturalWidth || currentImage.width;
    let sampleH = currentImage.naturalHeight || currentImage.height;

    if (sampleW > maxSampleDim || sampleH > maxSampleDim) {
      if (sampleW >= sampleH) {
        sampleH = Math.round((sampleH * maxSampleDim) / sampleW);
        sampleW = maxSampleDim;
      } else {
        sampleW = Math.round((sampleW * maxSampleDim) / sampleH);
        sampleH = maxSampleDim;
      }
    }

    offCanvas.width = sampleW;
    offCanvas.height = sampleH;
    const ctx = offCanvas.getContext('2d');
    ctx.drawImage(currentImage, 0, 0, sampleW, sampleH);

    const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;
    const pixels = [];

    for (let i = 0; i < imgData.length; i += 4) {
      const a = imgData[i + 3];
      // Skip transparent or near-transparent pixels
      if (a < 128) continue;

      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];

      if (shouldFilterExtremes) {
        // Exclude near pure white (r,g,b > 248) or near pure black (r,g,b < 12)
        if (r > 248 && g > 248 && b > 248) continue;
        if (r < 12 && g < 12 && b < 12) continue;
      }

      pixels.push({ r, g, b });
    }

    if (pixels.length === 0) {
      // If all were filtered out, re-sample without filtering
      for (let i = 0; i < imgData.length; i += 4) {
        pixels.push({ r: imgData[i], g: imgData[i + 1], b: imgData[i + 2] });
      }
    }

    let rawPalette = [];
    if (algo === 'kmeans') {
      rawPalette = kMeansQuantize(pixels, count);
    } else if (algo === 'vibrant') {
      rawPalette = vibrantQuantize(pixels, count);
    } else {
      rawPalette = medianCutQuantize(pixels, count);
    }

    // Enrich palette objects with hex, rgb, hsl, share
    extractedPalette = rawPalette.map(c => {
      const hex = rgbToHex(c.r, c.g, c.b);
      const hsl = rgbToHsl(c.r, c.g, c.b);
      return {
        r: c.r,
        g: c.g,
        b: c.b,
        hex,
        hsl,
        rgbStr: `rgb(${c.r}, ${c.g}, ${c.b})`,
        hslStr: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        share: c.share || 0,
        contrast: getContrastColor(c.r, c.g, c.b)
      };
    });

    // Sorting
    if (sortBy === 'hue') {
      extractedPalette.sort((a, b) => a.hsl.h - b.hsl.h);
    } else if (sortBy === 'lightness') {
      extractedPalette.sort((a, b) => a.hsl.l - b.hsl.l);
    } else {
      // Default: dominance
      extractedPalette.sort((a, b) => b.share - a.share);
    }

    renderPalette();
  }

  // --- Render Palette to UI ---
  function renderPalette() {
    if (extractedPalette.length === 0) return;

    emptyState.style.display = 'none';
    resultsArea.style.display = 'block';
    totalSamplesCount.textContent = `${extractedPalette.length} Swatches Extracted`;

    // 1. Render Proportional Ribbon
    paletteRibbon.innerHTML = '';
    const totalShare = extractedPalette.reduce((sum, c) => sum + (c.share || 0.05), 0) || 1;

    extractedPalette.forEach((c) => {
      const bar = document.createElement('div');
      bar.className = 'palette-ribbon-bar';
      const pct = Math.max(4, Math.round(((c.share || 0.05) / totalShare) * 100));
      bar.style.flex = `${pct} 1 0%`;
      bar.style.backgroundColor = c.hex;
      bar.title = `${c.hex} (${(c.share * 100).toFixed(1)}%) - Click to copy`;
      bar.addEventListener('click', () => copyText(c.hex, `Copied ${c.hex}!`));
      paletteRibbon.appendChild(bar);
    });

    // 2. Render Detailed Swatch Cards
    swatchCardsContainer.innerHTML = '';

    extractedPalette.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'swatch-card';

      const sharePercent = (c.share * 100).toFixed(1);

      card.innerHTML = `
        <div class="swatch-color-box" style="background-color: ${c.hex};" title="Click to copy ${c.hex}">
          <span class="swatch-share-badge">${sharePercent}%</span>
        </div>
        <div class="swatch-info">
          <div class="swatch-code-row">
            <span class="swatch-code-label">HEX</span>
            <span class="swatch-code-val" data-copy="${c.hex}">${c.hex}</span>
          </div>
          <div class="swatch-code-row">
            <span class="swatch-code-label">RGB</span>
            <span class="swatch-code-val" data-copy="${c.rgbStr}">${c.rgbStr}</span>
          </div>
          <div class="swatch-code-row">
            <span class="swatch-code-label">HSL</span>
            <span class="swatch-code-val" data-copy="${c.hslStr}">${c.hslStr}</span>
          </div>
        </div>
      `;

      // Click on color box to copy HEX
      card.querySelector('.swatch-color-box').addEventListener('click', () => {
        copyText(c.hex, `Copied ${c.hex}!`);
      });

      // Click on specific code val
      card.querySelectorAll('.swatch-code-val').forEach(elem => {
        elem.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = elem.getAttribute('data-copy');
          copyText(val, `Copied ${val}!`);
        });
      });

      swatchCardsContainer.appendChild(card);
    });
  }

  // --- Display Image on Canvas ---
  function displayImage(img, filename = 'Image') {
    currentImage = img;
    previewWrapper.style.display = 'block';

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    imageCanvas.width = w;
    imageCanvas.height = h;

    const ctx = imageCanvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    imageMeta.textContent = `${filename} &bull; ${w} &times; ${h}px`;

    processImagePalette();
  }

  // --- Load Image File ---
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => displayImage(img, file.name);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- Interactive Eyedropper / Loupe ---
  imageCanvas.addEventListener('mousemove', (e) => {
    if (!currentImage) return;

    const rect = imageCanvas.getBoundingClientRect();
    const scaleX = imageCanvas.width / rect.width;
    const scaleY = imageCanvas.height / rect.height;

    const canvasX = Math.floor((e.clientX - rect.left) * scaleX);
    const canvasY = Math.floor((e.clientY - rect.top) * scaleY);

    if (canvasX < 0 || canvasX >= imageCanvas.width || canvasY < 0 || canvasY >= imageCanvas.height) {
      canvasLoupe.style.display = 'none';
      eyedropperPreview.style.display = 'none';
      return;
    }

    const ctx = imageCanvas.getContext('2d');
    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    // Position loupe relative to container
    const containerRect = canvasContainer.getBoundingClientRect();
    const loupeX = e.clientX - containerRect.left;
    const loupeY = e.clientY - containerRect.top;

    canvasLoupe.style.display = 'block';
    canvasLoupe.style.left = `${loupeX}px`;
    canvasLoupe.style.top = `${loupeY}px`;
    canvasLoupe.style.backgroundColor = hex;

    // Eyedropper preview badge
    eyedropperPreview.style.display = 'inline-flex';
    eyedropperSwatch.style.backgroundColor = hex;
    eyedropperHex.textContent = hex;
  });

  imageCanvas.addEventListener('mouseleave', () => {
    canvasLoupe.style.display = 'none';
    eyedropperPreview.style.display = 'none';
  });

  imageCanvas.addEventListener('click', (e) => {
    if (!currentImage) return;
    const rect = imageCanvas.getBoundingClientRect();
    const scaleX = imageCanvas.width / rect.width;
    const scaleY = imageCanvas.height / rect.height;

    const canvasX = Math.floor((e.clientX - rect.left) * scaleX);
    const canvasY = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = imageCanvas.getContext('2d');
    const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    copyText(hex, `Picked & Copied: ${hex}`);
  });

  // --- Sample Presets Generation ---
  function generateSample(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (type === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, '#2d1b4e');
      grad.addColorStop(0.3, '#742767');
      grad.addColorStop(0.6, '#e05342');
      grad.addColorStop(0.85, '#fba338');
      grad.addColorStop(1, '#ffdf78');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);

      // Glowing Sun
      const sunGrad = ctx.createRadialGradient(300, 240, 10, 300, 240, 90);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.4, '#ffe17d');
      sunGrad.addColorStop(1, 'rgba(255,140,50,0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(300, 240, 90, 0, Math.PI * 2);
      ctx.fill();

      // Mountain silhouettes
      ctx.fillStyle = '#1c0c28';
      ctx.beginPath();
      ctx.moveTo(0, 400);
      ctx.lineTo(120, 290);
      ctx.lineTo(240, 360);
      ctx.lineTo(380, 260);
      ctx.lineTo(480, 330);
      ctx.lineTo(600, 240);
      ctx.lineTo(600, 400);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'cyberpunk') {
      ctx.fillStyle = '#0a0914';
      ctx.fillRect(0, 0, 600, 400);

      // Neon Gradients
      const g1 = ctx.createLinearGradient(0, 0, 600, 0);
      g1.addColorStop(0, '#00f0ff');
      g1.addColorStop(0.5, '#7b2cbf');
      g1.addColorStop(1, '#ff007f');
      ctx.strokeStyle = g1;
      ctx.lineWidth = 14;

      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(300, 200, 40 + i * 26, 0, Math.PI * 2);
        ctx.stroke();
      }

      const g2 = ctx.createLinearGradient(0, 0, 0, 400);
      g2.addColorStop(0, 'rgba(0,240,255,0.4)');
      g2.addColorStop(1, 'rgba(255,0,127,0.8)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.moveTo(300, 50);
      ctx.lineTo(480, 340);
      ctx.lineTo(120, 340);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'nature') {
      const grad = ctx.createLinearGradient(0, 0, 600, 400);
      grad.addColorStop(0, '#0b3c2e');
      grad.addColorStop(0.35, '#1e6f50');
      grad.addColorStop(0.7, '#48b87d');
      grad.addColorStop(1, '#a7e9af');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);

      // Leaves / organic circles
      const colors = ['#082a20', '#134e3a', '#2d8b63', '#64c28f', '#d2f3d6', '#f6b26b'];
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        const cx = 50 + (i * 32) % 550;
        const cy = 60 + ((i * 47) % 300);
        ctx.arc(cx, cy, 35 + (i * 7) % 45, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'ocean') {
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, '#02182b');
      grad.addColorStop(0.3, '#04395e');
      grad.addColorStop(0.6, '#0f7194');
      grad.addColorStop(0.85, '#29b6f6');
      grad.addColorStop(1, '#e0f7fa');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);

      // Waves
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, 240);
      ctx.bezierCurveTo(150, 200, 300, 280, 600, 220);
      ctx.lineTo(600, 400);
      ctx.lineTo(0, 400);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(41, 182, 246, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, 310);
      ctx.bezierCurveTo(200, 340, 400, 280, 600, 320);
      ctx.lineTo(600, 400);
      ctx.lineTo(0, 400);
      ctx.closePath();
      ctx.fill();
    }

    const img = new Image();
    img.onload = () => displayImage(img, `Sample-${type}.png`);
    img.src = canvas.toDataURL();
  }

  // --- Export Actions ---

  // 1. Copy as CSS Custom Properties
  btnCopyCss.addEventListener('click', () => {
    if (extractedPalette.length === 0) return;
    const cssLines = extractedPalette.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.rgbStr} */`).join('\n');
    const cssBlock = `:root {\n${cssLines}\n}`;
    copyText(cssBlock, 'Copied CSS Custom Properties!');
  });

  // 2. Copy Tailwind JSON
  btnCopyTailwind.addEventListener('click', () => {
    if (extractedPalette.length === 0) return;
    const tailwindObj = {
      theme: {
        extend: {
          colors: {}
        }
      }
    };
    extractedPalette.forEach((c, i) => {
      tailwindObj.theme.extend.colors[`palette-${i + 1}`] = c.hex;
    });
    copyText(JSON.stringify(tailwindObj, null, 2), 'Copied Tailwind Config JSON!');
  });

  // 3. Copy HEX Array
  btnCopyHex.addEventListener('click', () => {
    if (extractedPalette.length === 0) return;
    const hexArr = extractedPalette.map(c => c.hex);
    copyText(JSON.stringify(hexArr, null, 2), 'Copied HEX Array!');
  });

  // 4. Download Swatch Image PNG
  btnDownloadPalette.addEventListener('click', () => {
    if (extractedPalette.length === 0) return;

    const count = extractedPalette.length;
    const cardCanvas = document.createElement('canvas');
    const cardW = 1200;
    const cardH = 680;
    cardCanvas.width = cardW;
    cardCanvas.height = cardH;
    const ctx = cardCanvas.getContext('2d');

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, cardW, cardH);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#111827');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cardW, cardH);

    // Title & Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText('COLOR PALETTE EXTRACTOR', 60, 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText(`ALL IN ONE UTILITY \u2022 ${count} Dominant Color Swatches`, 60, 115);

    // Grid layout for swatches
    const paddingX = 60;
    const contentW = cardW - paddingX * 2;
    const cols = Math.min(count, 5);
    const rows = Math.ceil(count / cols);
    const swatchW = (contentW - (cols - 1) * 20) / cols;
    const swatchH = Math.min(180, (cardH - 220 - (rows - 1) * 25) / rows);

    extractedPalette.forEach((c, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = paddingX + col * (swatchW + 20);
      const y = 160 + row * (swatchH + 55);

      // Swatch Rectangle
      ctx.fillStyle = c.hex;
      ctx.beginPath();
      ctx.roundRect(x, y, swatchW, swatchH, 12);
      ctx.fill();

      // Border around swatch
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Labels below swatch
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(c.hex, x + 6, y + swatchH + 28);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(`${(c.share * 100).toFixed(1)}% \u2022 ${c.rgbStr}`, x + 6, y + swatchH + 48);
    });

    // Trigger download
    const link = document.createElement('a');
    link.download = `palette-${Date.now()}.png`;
    link.href = cardCanvas.toDataURL('image/png');
    link.click();
    showToast('Downloaded Swatch Card PNG!');
  });

  // --- Event Listeners ---
  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag & Drop
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // Paste from clipboard
  window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.files) {
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          handleFile(file);
          showToast('Image pasted from clipboard!');
          break;
        }
      }
    }
  });

  // Sample Buttons
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-sample');
      generateSample(type);
    });
  });

  // Controls changes
  swatchCountSelect.addEventListener('change', processImagePalette);
  algorithmSelect.addEventListener('change', processImagePalette);
  sortSelect.addEventListener('change', processImagePalette);
  filterExtremes.addEventListener('change', processImagePalette);

  // Load Sunset sample by default to immediately showcase the tool!
  generateSample('sunset');
});