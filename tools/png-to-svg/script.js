// PNG to SVG Vector Trace — High-Performance Client-Side Vectorizer

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const clearBtn = document.getElementById('clear-btn');
  const sampleButtons = document.querySelectorAll('.ptsv-sample-btn');

  const modeColorBtn = document.getElementById('mode-color-btn');
  const modeBwBtn = document.getElementById('mode-bw-btn');
  const colorsGroup = document.getElementById('colors-group');
  const colorsSlider = document.getElementById('colors-slider');
  const colorsValue = document.getElementById('colors-value');
  const paletteSwatches = document.getElementById('palette-swatches');

  const detailGroup = document.getElementById('detail-group');
  const detailLabel = document.getElementById('detail-label');
  const detailSlider = document.getElementById('detail-slider');
  const detailValue = document.getElementById('detail-value');

  const smoothButtons = document.querySelectorAll('.ptsv-smooth-btn');
  const transparentBgToggle = document.getElementById('transparent-bg-toggle');
  const traceBtn = document.getElementById('trace-btn');

  // Comparison & Stages
  const rasterPreviewImg = document.getElementById('raster-preview-img');
  const rasterPlaceholder = document.getElementById('raster-placeholder');
  const origDimsBadge = document.getElementById('orig-dims-badge');

  const svgResultWrap = document.getElementById('svg-result-wrap');
  const svgResultContainer = document.getElementById('svg-result-container');
  const vectorPlaceholder = document.getElementById('vector-placeholder');
  const vectorDimsBadge = document.getElementById('vector-dims-badge');

  const vectorZoomSlider = document.getElementById('vector-zoom-slider');
  const vectorZoomLabel = document.getElementById('vector-zoom-label');
  const vectorZoomIn = document.getElementById('vector-zoom-in');
  const vectorZoomOut = document.getElementById('vector-zoom-out');
  const vectorZoomFit = document.getElementById('vector-zoom-fit');

  // Statistics
  const statPaths = document.getElementById('stat-paths');
  const statPoints = document.getElementById('stat-points');
  const statSvgSize = document.getElementById('stat-svg-size');
  const statTime = document.getElementById('stat-time');

  // Code & Export
  const svgCodeOutput = document.getElementById('svg-code-output');
  const copySvgBtn = document.getElementById('copy-svg-btn');
  const downloadSvgBtn = document.getElementById('download-svg-btn');
  const downloadAnchor = document.getElementById('download-anchor');
  const toast = document.getElementById('ptsv-toast');

  // State
  let currentImage = null; // Loaded HTMLImageElement
  let imageFileName = 'vector_trace';
  let vectorMode = 'color'; // 'color' | 'bw'
  let colorCount = 6;
  let detailLevel = 65; // 10 - 100
  let smoothingMode = 'medium'; // 'low' | 'medium' | 'high'
  let ignoreBg = true;
  let currentZoom = 100;
  let generatedSvgMarkup = '';
  let traceDebounceTimer = null;

  // ─── SAMPLE GENERATORS ──────────────────────────────────────
  // Generate crisp procedural raster images for quick testing
  function generateSampleImage(type) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;

    if (type === 'tech-logo') {
      // Tech geometric badge on dark canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 400, 400);

      // Outer glowing polygon
      ctx.beginPath();
      ctx.moveTo(200, 50);
      ctx.lineTo(340, 130);
      ctx.lineTo(340, 270);
      ctx.lineTo(200, 350);
      ctx.lineTo(60, 270);
      ctx.lineTo(60, 130);
      ctx.closePath();
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Cyan facet
      ctx.beginPath();
      ctx.moveTo(200, 90);
      ctx.lineTo(310, 150);
      ctx.lineTo(200, 210);
      ctx.lineTo(90, 150);
      ctx.closePath();
      ctx.fillStyle = '#06b6d4';
      ctx.fill();

      // Violet facet
      ctx.beginPath();
      ctx.moveTo(90, 150);
      ctx.lineTo(200, 210);
      ctx.lineTo(200, 310);
      ctx.lineTo(90, 250);
      ctx.closePath();
      ctx.fillStyle = '#3b82f6';
      ctx.fill();

      // Magenta facet
      ctx.beginPath();
      ctx.moveTo(310, 150);
      ctx.lineTo(200, 210);
      ctx.lineTo(200, 310);
      ctx.lineTo(310, 250);
      ctx.closePath();
      ctx.fillStyle = '#8b5cf6';
      ctx.fill();

      // Central core
      ctx.beginPath();
      ctx.arc(200, 210, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

    } else if (type === 'star-badge') {
      // Shield / Emblem
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 400, 400);

      // Outer navy shield
      ctx.beginPath();
      ctx.moveTo(200, 40);
      ctx.lineTo(330, 80);
      ctx.lineTo(310, 260);
      ctx.lineTo(200, 360);
      ctx.lineTo(90, 260);
      ctx.lineTo(70, 80);
      ctx.closePath();
      ctx.fillStyle = '#1e3a8a';
      ctx.fill();

      // Gold inner star
      ctx.beginPath();
      const points = 5;
      const outerR = 90;
      const innerR = 45;
      const cx = 200, cy = 190;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Red star core
      ctx.beginPath();
      ctx.arc(200, 190, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();

    } else if (type === 'stencil-icon') {
      // High-contrast silhouette stencil
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);

      ctx.fillStyle = '#111827';
      // Camera body
      ctx.beginPath();
      roundRect(ctx, 70, 120, 260, 190, 32);
      ctx.fill();

      // Camera top flash
      ctx.beginPath();
      roundRect(ctx, 150, 80, 100, 40, 12);
      ctx.fill();

      // Outer lens knockout (white)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(200, 215, 60, 0, Math.PI * 2);
      ctx.fill();

      // Inner lens (black)
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(200, 215, 42, 0, Math.PI * 2);
      ctx.fill();

      // Lens glare dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(215, 200, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas.toDataURL('image/png');
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  // ─── SAMPLE BUTTONS EVENT LISTENERS ─────────────────────────
  sampleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleKey = btn.getAttribute('data-sample');
      const dataUrl = generateSampleImage(sampleKey);
      imageFileName = sampleKey;
      loadImageFromUrl(dataUrl, sampleKey);
      showToast(`Loaded sample: ${btn.textContent.trim()}`);
    });
  });

  // ─── DRAG & DROP & FILE BROWSE ───────────────────────────────
  dropZone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
    dropZone.addEventListener(ev, e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  ['dragenter', 'dragover'].forEach(ev => {
    dropZone.addEventListener(ev, () => dropZone.classList.add('dragover'));
  });

  ['dragleave', 'drop'].forEach(ev => {
    dropZone.addEventListener(ev, () => dropZone.classList.remove('dragover'));
  });

  dropZone.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid raster image (PNG, JPG, WebP)');
      return;
    }

    imageFileName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = e => {
      loadImageFromUrl(e.target.result, imageFileName);
      showToast(`Loaded ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  function loadImageFromUrl(url, name) {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      rasterPreviewImg.src = url;
      rasterPreviewImg.style.display = 'block';
      rasterPlaceholder.style.display = 'none';
      origDimsBadge.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;

      // Schedule trace
      runVectorTrace();
    };
    img.src = url;
  }

  // ─── CONTROL LISTENERS ───────────────────────────────────────
  modeColorBtn.addEventListener('click', () => {
    setMode('color');
  });

  modeBwBtn.addEventListener('click', () => {
    setMode('bw');
  });

  function setMode(mode) {
    vectorMode = mode;
    if (mode === 'color') {
      modeColorBtn.classList.add('active');
      modeBwBtn.classList.remove('active');
      colorsGroup.style.display = 'flex';
      detailLabel.textContent = 'Trace Detail Level';
      detailValue.textContent = `${detailLevel}%`;
    } else {
      modeBwBtn.classList.add('active');
      modeColorBtn.classList.remove('active');
      colorsGroup.style.display = 'none';
      detailLabel.textContent = 'B&W Threshold';
      detailValue.textContent = `${Math.round((detailLevel / 100) * 255)}`;
    }
    scheduleTrace();
  }

  colorsSlider.addEventListener('input', () => {
    colorCount = parseInt(colorsSlider.value, 10);
    colorsValue.textContent = `${colorCount} colors`;
    scheduleTrace();
  });

  detailSlider.addEventListener('input', () => {
    detailLevel = parseInt(detailSlider.value, 10);
    if (vectorMode === 'color') {
      detailValue.textContent = `${detailLevel}%`;
    } else {
      detailValue.textContent = `${Math.round((detailLevel / 100) * 255)}`;
    }
    scheduleTrace();
  });

  smoothButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      smoothButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      smoothingMode = btn.getAttribute('data-smooth');
      scheduleTrace();
    });
  });

  transparentBgToggle.addEventListener('change', () => {
    ignoreBg = transparentBgToggle.checked;
    scheduleTrace();
  });

  traceBtn.addEventListener('click', () => {
    runVectorTrace();
  });

  function scheduleTrace() {
    clearTimeout(traceDebounceTimer);
    traceDebounceTimer = setTimeout(() => {
      runVectorTrace();
    }, 250);
  }

  // ─── VECTOR TRACING ENGINE ──────────────────────────────────
  function runVectorTrace() {
    if (!currentImage) return;

    const startTime = performance.now();
    const origW = currentImage.naturalWidth || 400;
    const origH = currentImage.naturalHeight || 400;

    // Grid dimension calculation based on detail level (fast & responsive)
    // Scale max dimension between 140px and 440px
    const maxGridDim = Math.round(140 + (detailLevel / 100) * 300);
    let traceW = origW;
    let traceH = origH;
    if (traceW > maxGridDim || traceH > maxGridDim) {
      if (traceW >= traceH) {
        traceH = Math.max(16, Math.round((origH / origW) * maxGridDim));
        traceW = maxGridDim;
      } else {
        traceW = Math.max(16, Math.round((origW / origH) * maxGridDim));
        traceH = maxGridDim;
      }
    }

    const scaleX = origW / traceW;
    const scaleY = origH / traceH;

    // Offscreen Canvas for Pixel Sampling
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = traceW;
    sampleCanvas.height = traceH;
    const sCtx = sampleCanvas.getContext('2d');
    sCtx.imageSmoothingEnabled = true;
    sCtx.drawImage(currentImage, 0, 0, traceW, traceH);

    const imgData = sCtx.getImageData(0, 0, traceW, traceH);
    const data = imgData.data;

    let pathsMarkup = '';
    let totalPathsCount = 0;
    let totalPointsCount = 0;

    if (vectorMode === 'bw') {
      // ─── BLACK & WHITE STENCIL MODE ─────────────────────────
      const threshold = Math.round((detailLevel / 100) * 255);
      const binaryGrid = new Uint8Array(traceW * traceH);

      for (let y = 0; y < traceH; y++) {
        for (let x = 0; x < traceW; x++) {
          const idx = (y * traceW + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a < 50) {
            binaryGrid[y * traceW + x] = 0;
          } else {
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            binaryGrid[y * traceW + x] = lum <= threshold ? 1 : 0;
          }
        }
      }

      // Trace Contours for B&W
      const loops = extractBoundaryLoops(binaryGrid, traceW, traceH);
      const simplified = simplifyLoops(loops, smoothingMode, scaleX, scaleY);

      if (simplified.length > 0) {
        const pathData = buildSvgPathData(simplified, smoothingMode);
        if (pathData) {
          totalPathsCount++;
          totalPointsCount += simplified.reduce((acc, l) => acc + l.length, 0);
          pathsMarkup += `  <path d="${pathData}" fill="#111827" fill-rule="evenodd" />\n`;
        }
      }

      paletteSwatches.innerHTML = `<span class="ptsv-palette-swatch" style="background: #111827;" title="Black Stencil"></span>`;

    } else {
      // ─── COLOR VECTOR MODE ──────────────────────────────────
      // 1. Quantize image palette into colorCount clusters using K-means
      const palette = extractPaletteKMeans(data, traceW, traceH, colorCount);

      // Render swatches in UI
      paletteSwatches.innerHTML = palette
        .map(c => `<span class="ptsv-palette-swatch" style="background: ${c.hex};" title="${c.hex}"></span>`)
        .join('');

      // 2. Assign each pixel to nearest palette index
      const pixelClusters = new Int16Array(traceW * traceH);
      const clusterCounts = new Int32Array(palette.length);

      for (let y = 0; y < traceH; y++) {
        for (let x = 0; x < traceW; x++) {
          const idx = (y * traceW + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a < 40) {
            pixelClusters[y * traceW + x] = -1; // Transparent
          } else {
            let bestDist = Infinity;
            let bestIdx = 0;
            for (let k = 0; k < palette.length; k++) {
              const dr = r - palette[k].r;
              const dg = g - palette[k].g;
              const db = b - palette[k].b;
              const dist = dr * dr + dg * dg + db * db;
              if (dist < bestDist) {
                bestDist = dist;
                bestIdx = k;
              }
            }
            pixelClusters[y * traceW + x] = bestIdx;
            clusterCounts[bestIdx]++;
          }
        }
      }

      // Identify background cluster (most frequent color, or highest border coverage)
      let bgClusterIdx = -1;
      let maxCount = -1;
      for (let k = 0; k < palette.length; k++) {
        if (clusterCounts[k] > maxCount) {
          maxCount = clusterCounts[k];
          bgClusterIdx = k;
        }
      }

      // Order layers: draw dominant/background layer first, finer layers on top
      const layerOrder = [];
      for (let k = 0; k < palette.length; k++) {
        layerOrder.push({ index: k, count: clusterCounts[k], color: palette[k] });
      }
      layerOrder.sort((a, b) => b.count - a.count); // Largest area first

      // 3. For each color layer, extract boundary contours
      for (let i = 0; i < layerOrder.length; i++) {
        const layer = layerOrder[i];
        if (layer.count <= 0) continue;

        // Skip background if ignoreBg is active and this is the dominant bg cluster
        if (ignoreBg && layer.index === bgClusterIdx) {
          continue;
        }

        const binaryGrid = new Uint8Array(traceW * traceH);
        for (let j = 0; j < pixelClusters.length; j++) {
          binaryGrid[j] = pixelClusters[j] === layer.index ? 1 : 0;
        }

        const loops = extractBoundaryLoops(binaryGrid, traceW, traceH);
        const simplified = simplifyLoops(loops, smoothingMode, scaleX, scaleY);

        if (simplified.length > 0) {
          const pathData = buildSvgPathData(simplified, smoothingMode);
          if (pathData) {
            totalPathsCount++;
            totalPointsCount += simplified.reduce((acc, l) => acc + l.length, 0);
            pathsMarkup += `  <!-- Layer ${layer.index + 1}: ${layer.color.hex} -->\n`;
            pathsMarkup += `  <path d="${pathData}" fill="${layer.color.hex}" fill-rule="evenodd" />\n`;
          }
        }
      }
    }

    // Assemble final SVG markup
    const finalSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origW} ${origH}" width="${origW}" height="${origH}">
  <g id="vector-trace">
${pathsMarkup}  </g>
</svg>`;

    const elapsed = Math.max(1, Math.round(performance.now() - startTime));
    generatedSvgMarkup = finalSvg;

    // Render in UI
    svgResultContainer.innerHTML = finalSvg;
    svgResultWrap.style.display = 'flex';
    vectorPlaceholder.style.display = 'none';

    // Update code output
    svgCodeOutput.textContent = finalSvg;

    // Update stats
    statPaths.textContent = totalPathsCount.toLocaleString();
    statPoints.textContent = totalPointsCount.toLocaleString();
    statSvgSize.textContent = formatBytes(new Blob([finalSvg]).size);
    statTime.textContent = `${elapsed} ms`;
    vectorDimsBadge.textContent = `${origW} × ${origH}`;

    // Enable Buttons
    copySvgBtn.disabled = false;
    downloadSvgBtn.disabled = false;
  }

  // ─── PALETTE EXTRACTION (K-MEANS) ───────────────────────────
  function extractPaletteKMeans(data, w, h, k) {
    const samples = [];
    const step = Math.max(1, Math.floor((w * h) / 1200));

    for (let i = 0; i < data.length; i += step * 4) {
      if (data[i + 3] > 60) {
        samples.push([data[i], data[i + 1], data[i + 2]]);
      }
    }

    if (samples.length === 0) {
      return [{ r: 0, g: 0, b: 0, hex: '#000000' }];
    }

    // Initialize centroids evenly spaced
    const centroids = [];
    for (let i = 0; i < k; i++) {
      const idx = Math.floor((i / k) * samples.length);
      centroids.push([...samples[idx]]);
    }

    // Run 5 iterations of K-Means
    const maxIters = 5;
    for (let iter = 0; iter < maxIters; iter++) {
      const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);

      for (let s = 0; s < samples.length; s++) {
        const [r, g, b] = samples[s];
        let bestDist = Infinity;
        let bestC = 0;

        for (let c = 0; c < k; c++) {
          const dr = r - centroids[c][0];
          const dg = g - centroids[c][1];
          const db = b - centroids[c][2];
          const dist = dr * dr + dg * dg + db * db;
          if (dist < bestDist) {
            bestDist = dist;
            bestC = c;
          }
        }

        sums[bestC][0] += r;
        sums[bestC][1] += g;
        sums[bestC][2] += b;
        sums[bestC][3]++;
      }

      for (let c = 0; c < k; c++) {
        if (sums[c][3] > 0) {
          centroids[c][0] = Math.round(sums[c][0] / sums[c][3]);
          centroids[c][1] = Math.round(sums[c][1] / sums[c][3]);
          centroids[c][2] = Math.round(sums[c][2] / sums[c][3]);
        }
      }
    }

    return centroids.map(([r, g, b]) => ({
      r, g, b,
      hex: rgbToHex(r, g, b)
    }));
  }

  function rgbToHex(r, g, b) {
    const toHex = c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // ─── CONTOUR EXTRACTION VIA DIRECTED BOUNDARY WALKING ────────
  function extractBoundaryLoops(grid, w, h) {
    const stride = w + 1;
    const vertexKey = (x, y) => y * stride + x;

    // Map vertexKey -> array of outgoing neighbor vertexKeys
    const adj = new Map();
    let edgeCount = 0;

    function addEdge(x1, y1, x2, y2) {
      const u = vertexKey(x1, y1);
      const v = vertexKey(x2, y2);
      let list = adj.get(u);
      if (!list) {
        list = [];
        adj.set(u, list);
      }
      list.push(v);
      edgeCount++;
    }

    // Traverse grid cells and generate oriented boundary edges
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (grid[y * w + x] === 1) {
          // Top edge (clockwise: (x,y) -> (x+1,y))
          if (y === 0 || grid[(y - 1) * w + x] === 0) {
            addEdge(x, y, x + 1, y);
          }
          // Right edge ((x+1,y) -> (x+1,y+1))
          if (x === w - 1 || grid[y * w + (x + 1)] === 0) {
            addEdge(x + 1, y, x + 1, y + 1);
          }
          // Bottom edge ((x+1,y+1) -> (x,y+1))
          if (y === h - 1 || grid[(y + 1) * w + x] === 0) {
            addEdge(x + 1, y + 1, x, y + 1);
          }
          // Left edge ((x,y+1) -> (x,y))
          if (x === 0 || grid[y * w + (x - 1)] === 0) {
            addEdge(x, y + 1, x, y);
          }
        }
      }
    }

    if (edgeCount === 0) return [];

    // Chain directed edges into closed loops
    const loops = [];
    const maxSafetySteps = edgeCount * 2;

    for (const [startU, outgoing] of adj.entries()) {
      while (outgoing.length > 0) {
        const loop = [];
        let curr = startU;
        let steps = 0;

        while (steps++ < maxSafetySteps) {
          const x = curr % stride;
          const y = Math.floor(curr / stride);
          loop.push({ x, y });

          const neighbors = adj.get(curr);
          if (!neighbors || neighbors.length === 0) break;

          const next = neighbors.pop(); // take and consume edge
          curr = next;

          if (curr === startU) {
            // Closed cycle completed!
            break;
          }
        }

        if (loop.length >= 3) {
          // Filter out tiny 1-pixel noise specks if detail is moderate
          const area = Math.abs(polygonArea(loop));
          if (area >= 1.5) {
            loops.push(loop);
          }
        }
      }
    }

    return loops;
  }

  function polygonArea(points) {
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return area / 2;
  }

  // ─── SIMPLIFICATION & SMOOTHING ──────────────────────────────
  function simplifyLoops(loops, smoothing, scaleX, scaleY) {
    const epsMap = {
      low: 0.35,
      medium: 0.95,
      high: 2.1
    };
    const epsilon = epsMap[smoothing] || 0.95;

    const result = [];
    for (let i = 0; i < loops.length; i++) {
      const rawLoop = loops[i];
      // 1. Remove consecutive collinear points
      const collinearReduced = removeCollinear(rawLoop);
      if (collinearReduced.length < 3) continue;

      // 2. Ramer-Douglas-Peucker simplification
      const simplified = rdp(collinearReduced, epsilon);
      if (simplified.length < 3) continue;

      // 3. Scale to original dimensions & round coordinates
      const scaled = simplified.map(pt => ({
        x: Math.round(pt.x * scaleX * 10) / 10,
        y: Math.round(pt.y * scaleY * 10) / 10
      }));

      result.push(scaled);
    }
    return result;
  }

  function removeCollinear(points) {
    const n = points.length;
    if (n < 3) return points;
    const out = [];

    for (let i = 0; i < n; i++) {
      const prev = points[(i - 1 + n) % n];
      const curr = points[i];
      const next = points[(i + 1) % n];

      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;

      // Cross product zero means collinear
      if (dx1 * dy2 === dy1 * dx2) {
        continue;
      }
      out.push(curr);
    }
    return out.length >= 3 ? out : points;
  }

  function rdp(points, epsilon) {
    if (points.length <= 2) return points;

    let dmax = 0;
    let index = 0;
    const end = points.length - 1;

    for (let i = 1; i < end; i++) {
      const d = perpendicularDistance(points[i], points[0], points[end]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }

    if (dmax > epsilon) {
      const recResults1 = rdp(points.slice(0, index + 1), epsilon);
      const recResults2 = rdp(points.slice(index), epsilon);
      return recResults1.slice(0, recResults1.length - 1).concat(recResults2);
    } else {
      return [points[0], points[end]];
    }
  }

  function perpendicularDistance(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) {
      return Math.hypot(p.x - a.x, p.y - a.y);
    }
    const num = Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x);
    return num / Math.hypot(dx, dy);
  }

  // ─── SVG PATH COMMAND BUILDER ────────────────────────────────
  function buildSvgPathData(loops, smoothing) {
    const parts = [];

    for (let l = 0; l < loops.length; l++) {
      const pts = loops[l];
      if (pts.length < 3) continue;

      if (smoothing === 'low') {
        // Sharp polygonal lines
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
          d += ` L ${pts[i].x} ${pts[i].y}`;
        }
        d += ' Z';
        parts.push(d);
      } else {
        // Smooth quadratic Bezier curve through midpoints
        const n = pts.length;
        const midpoints = [];
        for (let i = 0; i < n; i++) {
          const next = pts[(i + 1) % n];
          midpoints.push({
            x: Math.round(((pts[i].x + next.x) / 2) * 10) / 10,
            y: Math.round(((pts[i].y + next.y) / 2) * 10) / 10
          });
        }

        let d = `M ${midpoints[0].x} ${midpoints[0].y}`;
        for (let i = 0; i < n; i++) {
          const ctrl = pts[(i + 1) % n];
          const mid = midpoints[(i + 1) % n];
          d += ` Q ${ctrl.x} ${ctrl.y} ${mid.x} ${mid.y}`;
        }
        d += ' Z';
        parts.push(d);
      }
    }

    return parts.join(' ');
  }

  // ─── ZOOM CONTROLS ───────────────────────────────────────────
  function applyVectorZoom() {
    vectorZoomLabel.textContent = `${currentZoom}%`;
    vectorZoomSlider.value = currentZoom;
    svgResultWrap.style.transform = `scale(${currentZoom / 100})`;
  }

  vectorZoomSlider.addEventListener('input', () => {
    currentZoom = parseInt(vectorZoomSlider.value, 10);
    applyVectorZoom();
  });

  vectorZoomIn.addEventListener('click', () => {
    currentZoom = Math.min(300, currentZoom + 25);
    applyVectorZoom();
  });

  vectorZoomOut.addEventListener('click', () => {
    currentZoom = Math.max(25, currentZoom - 25);
    applyVectorZoom();
  });

  vectorZoomFit.addEventListener('click', () => {
    currentZoom = 100;
    applyVectorZoom();
  });

  // ─── EXPORT & ACTIONS ────────────────────────────────────────
  copySvgBtn.addEventListener('click', async () => {
    if (!generatedSvgMarkup) return;

    try {
      await navigator.clipboard.writeText(generatedSvgMarkup);
      showToast('SVG Markup copied to clipboard!');
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = generatedSvgMarkup;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('SVG copied to clipboard!');
    }
  });

  downloadSvgBtn.addEventListener('click', () => {
    if (!generatedSvgMarkup) return;

    const blob = new Blob([generatedSvgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const filename = `${imageFileName || 'vector_trace'}.svg`;

    downloadAnchor.href = url;
    downloadAnchor.download = filename;
    downloadAnchor.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Downloaded ${filename}`);
  });

  clearBtn.addEventListener('click', () => {
    currentImage = null;
    rasterPreviewImg.src = '';
    rasterPreviewImg.style.display = 'none';
    rasterPlaceholder.style.display = 'block';
    origDimsBadge.textContent = '0 × 0';

    svgResultContainer.innerHTML = '';
    svgResultWrap.style.display = 'none';
    vectorPlaceholder.style.display = 'block';
    vectorDimsBadge.textContent = 'Scalable';

    svgCodeOutput.textContent = '<!-- Vectorized SVG markup will appear here -->';
    copySvgBtn.disabled = true;
    downloadSvgBtn.disabled = true;

    statPaths.textContent = '0';
    statPoints.textContent = '0';
    statSvgSize.textContent = '0 B';
    statTime.textContent = '0 ms';
    paletteSwatches.innerHTML = '';

    fileInput.value = '';
    showToast('Workspace cleared.');
  });

  // ─── HELPERS ─────────────────────────────────────────────────
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  let toastTimer = null;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Initialize with Sample "Tech Logo"
  const defaultSampleUrl = generateSampleImage('tech-logo');
  imageFileName = 'tech_logo';
  loadImageFromUrl(defaultSampleUrl, 'tech_logo');
});