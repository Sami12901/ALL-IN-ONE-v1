/**
 * ALL-IN-ONE-v1 Shared Media Removal Engine
 * High-performance, 100% client-side, zero-dependency media inpainting,
 * delogo, interactive selection, and video processing library.
 *
 * Algorithms implemented:
 * 1. Alexandru Telea Fast Marching Method (FMM) Inpainting
 * 2. Navier-Stokes 2D Fluid Vorticity Isophote Transport Inpainting
 * 3. Criminisi Exemplar-Based Patch Synthesis Inpainting
 * 4. Real-Time Border-Bilinear Delogo with Edge-Preserving Blur
 * 5. Multi-Frame Temporal Exponential Moving Average & Scene-Cut Detection
 * 6. Interactive Dual Selection Controller (8-handle Bounding Box & Bezier Brush)
 * 7. Deterministic Video Processing Pipeline with Web Audio Preservation
 * 8. Procedural Synthetic Media Generators
 *
 * Compatible with Browser (window.MediaRemovalEngine / ESM) and Node.js (CommonJS / globalThis).
 */

(function (root, factory) {
  const exports = factory();
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports;
  }
  if (typeof define === 'function' && define.amd) {
    define([], () => exports);
  }
  if (root) {
    root.MediaRemovalEngine = exports;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.MediaRemovalEngine = exports;
  }
  if (typeof window !== 'undefined') {
    window.MediaRemovalEngine = exports;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // Helper: ImageData Factory (Environment Agnostic)
  // =========================================================================
  function createImageData(width, height, data) {
    if (typeof ImageData !== 'undefined') {
      if (data) {
        return new ImageData(new Uint8ClampedArray(data), width, height);
      }
      return new ImageData(width, height);
    }
    // Node.js or non-DOM environment polyfill
    const length = width * height * 4;
    const clamped = data ? new Uint8ClampedArray(data) : new Uint8ClampedArray(length);
    return {
      width,
      height,
      data: clamped
    };
  }

  function cloneImageData(src) {
    const copy = createImageData(src.width, src.height);
    copy.data.set(src.data);
    return copy;
  }

  // =========================================================================
  // High-Performance Binary Min-Heap for Fast Marching Method
  // =========================================================================
  class PriorityQueue {
    constructor(capacity) {
      this.heapIdx = new Int32Array(capacity + 1);
      this.heapVal = new Float32Array(capacity + 1);
      this.heapPos = new Int32Array(capacity);
      this.heapPos.fill(-1);
      this.size = 0;
    }

    push(idx, val) {
      let i = ++this.size;
      while (i > 1) {
        const parent = i >> 1;
        if (this.heapVal[parent] <= val) break;
        this.heapIdx[i] = this.heapIdx[parent];
        this.heapVal[i] = this.heapVal[parent];
        this.heapPos[this.heapIdx[i]] = i;
        i = parent;
      }
      this.heapIdx[i] = idx;
      this.heapVal[i] = val;
      this.heapPos[idx] = i;
    }

    pop() {
      if (this.size === 0) return -1;
      const minIdx = this.heapIdx[1];
      this.heapPos[minIdx] = -1;
      const lastIdx = this.heapIdx[this.size];
      const lastVal = this.heapVal[this.size];
      this.size--;

      if (this.size > 0) {
        let i = 1;
        while ((i << 1) <= this.size) {
          let child = i << 1;
          if (child < this.size && this.heapVal[child + 1] < this.heapVal[child]) {
            child++;
          }
          if (lastVal <= this.heapVal[child]) break;
          this.heapIdx[i] = this.heapIdx[child];
          this.heapVal[i] = this.heapVal[child];
          this.heapPos[this.heapIdx[i]] = i;
          i = child;
        }
        this.heapIdx[i] = lastIdx;
        this.heapVal[i] = lastVal;
        this.heapPos[lastIdx] = i;
      }
      return minIdx;
    }

    update(idx, val) {
      let i = this.heapPos[idx];
      if (i === -1) {
        this.push(idx, val);
        return;
      }
      if (val < this.heapVal[i]) {
        this.heapVal[i] = val;
        while (i > 1) {
          const parent = i >> 1;
          if (this.heapVal[parent] <= val) break;
          this.heapIdx[i] = this.heapIdx[parent];
          this.heapVal[i] = this.heapVal[parent];
          this.heapPos[this.heapIdx[i]] = i;
          i = parent;
        }
        this.heapIdx[i] = idx;
        this.heapPos[idx] = i;
      }
    }

    isEmpty() {
      return this.size === 0;
    }
  }

  // =========================================================================
  // 1. Alexandru Telea Fast Marching Method (FMM) Inpainting
  // =========================================================================
  /**
   * Inpaints missing or masked regions using Alexandru Telea's Fast Marching Method.
   * Propagates boundary colors inward along the gradient normal of the distance field.
   *
   * @param {ImageData} imageData - Target pixel buffer (width, height, data)
   * @param {Uint8Array} binaryMask - 1-channel mask (W * H) where > 0 indicates region to inpaint
   * @param {number} [radius=3] - Inpainting neighborhood radius (default 3)
   * @returns {ImageData} Inpainted image data
   */
  function inpaintTelea(imageData, binaryMask, radius = 3) {
    const W = imageData.width;
    const H = imageData.height;
    const N = W * H;
    const output = cloneImageData(imageData);
    const data = output.data;

    // Status flags
    const KNOWN = 0;
    const BAND = 1;
    const INSIDE = 2;

    const flags = new Uint8Array(N);
    const dist = new Float32Array(N);
    const heap = new PriorityQueue(N);

    let insideCount = 0;
    for (let i = 0; i < N; i++) {
      if (binaryMask[i] > 0) {
        flags[i] = INSIDE;
        dist[i] = 1e9;
        insideCount++;
      } else {
        flags[i] = KNOWN;
        dist[i] = 0;
      }
    }

    // Nothing to inpaint
    if (insideCount === 0 || insideCount === N) {
      return output;
    }

    // Solve Eikonal equation for distance map: |grad T| = 1
    function solveEikonal(x, y) {
      let Tx = 1e9;
      let Ty = 1e9;

      // X direction
      if (x > 0 && flags[y * W + x - 1] === KNOWN) {
        Tx = Math.min(Tx, dist[y * W + x - 1]);
      }
      if (x < W - 1 && flags[y * W + x + 1] === KNOWN) {
        Tx = Math.min(Tx, dist[y * W + x + 1]);
      }

      // Y direction
      if (y > 0 && flags[(y - 1) * W + x] === KNOWN) {
        Ty = Math.min(Ty, dist[(y - 1) * W + x]);
      }
      if (y < H - 1 && flags[(y + 1) * W + x] === KNOWN) {
        Ty = Math.min(Ty, dist[(y + 1) * W + x]);
      }

      if (Tx < 1e9 && Ty < 1e9) {
        const diff = Tx - Ty;
        if (Math.abs(diff) < 1) {
          return 0.5 * (Tx + Ty + Math.sqrt(2 - diff * diff));
        }
        return Math.min(Tx, Ty) + 1;
      }
      if (Tx < 1e9) return Tx + 1;
      if (Ty < 1e9) return Ty + 1;
      return 1e9;
    }

    // Initialize Narrow Band
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        if (flags[idx] === INSIDE) {
          const hasKnownNeighbor =
            (x > 0 && flags[idx - 1] === KNOWN) ||
            (x < W - 1 && flags[idx + 1] === KNOWN) ||
            (y > 0 && flags[idx - W] === KNOWN) ||
            (y < H - 1 && flags[idx + W] === KNOWN);

          if (hasKnownNeighbor) {
            flags[idx] = BAND;
            dist[idx] = solveEikonal(x, y);
            heap.push(idx, dist[idx]);
          }
        }
      }
    }

    const radSq = radius * radius;

    // Fast Marching Inpainting Loop
    while (!heap.isEmpty()) {
      const pIdx = heap.pop();
      if (pIdx === -1) break;

      const px = pIdx % W;
      const py = Math.floor(pIdx / W);

      flags[pIdx] = KNOWN;

      // 1. Calculate gradient of distance map grad T(p) = (gx, gy)
      let gx = 0;
      let gy = 0;

      const hasL = px > 0 && flags[pIdx - 1] === KNOWN;
      const hasR = px < W - 1 && flags[pIdx + 1] === KNOWN;
      if (hasL && hasR) gx = (dist[pIdx + 1] - dist[pIdx - 1]) * 0.5;
      else if (hasL) gx = dist[pIdx] - dist[pIdx - 1];
      else if (hasR) gx = dist[pIdx + 1] - dist[pIdx];

      const hasU = py > 0 && flags[pIdx - W] === KNOWN;
      const hasD = py < H - 1 && flags[pIdx + W] === KNOWN;
      if (hasU && hasD) gy = (dist[pIdx + W] - dist[pIdx - W]) * 0.5;
      else if (hasU) gy = dist[pIdx] - dist[pIdx - W];
      else if (hasD) gy = dist[pIdx + W] - dist[pIdx];

      const gradLen = Math.hypot(gx, gy);
      let nx = 0;
      let ny = 0;
      if (gradLen > 1e-4) {
        nx = gx / gradLen;
        ny = gy / gradLen;
      }

      // 2. Synthesize color at p from neighboring KNOWN pixels
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumA = 0;
      let sumW = 0;

      const yMin = Math.max(0, py - radius);
      const yMax = Math.min(H - 1, py + radius);
      const xMin = Math.max(0, px - radius);
      const xMax = Math.min(W - 1, px + radius);

      for (let qy = yMin; qy <= yMax; qy++) {
        const dy = py - qy;
        for (let qx = xMin; qx <= xMax; qx++) {
          const dx = px - qx;
          const dSq = dx * dx + dy * dy;
          if (dSq > radSq || dSq === 0) continue;

          const qIdx = qy * W + qx;
          if (flags[qIdx] !== KNOWN) continue;

          const d = Math.sqrt(dSq);

          // Directional weight: |(p - q) . N| / ||p - q||
          let dir = gradLen > 1e-4 ? Math.abs(dx * nx + dy * ny) / d : 1.0;
          dir = Math.max(0.01, dir);

          // Geometric distance weight: 1 / d^2
          const dst = 1.0 / dSq;

          // Level-set distance weight: 1 / (1 + |T(p) - T(q)|)
          const lev = 1.0 / (1.0 + Math.abs(dist[pIdx] - dist[qIdx]));

          const w = dir * dst * lev;
          const qDataIdx = qIdx << 2;

          sumR += w * data[qDataIdx];
          sumG += w * data[qDataIdx + 1];
          sumB += w * data[qDataIdx + 2];
          sumA += w * data[qDataIdx + 3];
          sumW += w;
        }
      }

      const pDataIdx = pIdx << 2;
      if (sumW > 0) {
        data[pDataIdx] = Math.round(sumR / sumW);
        data[pDataIdx + 1] = Math.round(sumG / sumW);
        data[pDataIdx + 2] = Math.round(sumB / sumW);
        data[pDataIdx + 3] = Math.round(sumA / sumW);
      }

      // 3. Update 4-connected neighbors
      const neighbors = [
        [px - 1, py],
        [px + 1, py],
        [px, py - 1],
        [px, py + 1]
      ];

      for (let n = 0; n < 4; n++) {
        const nxPos = neighbors[n][0];
        const nyPos = neighbors[n][1];
        if (nxPos < 0 || nxPos >= W || nyPos < 0 || nyPos >= H) continue;

        const nIdx = nyPos * W + nxPos;
        if (flags[nIdx] === INSIDE) {
          flags[nIdx] = BAND;
          dist[nIdx] = solveEikonal(nxPos, nyPos);
          heap.push(nIdx, dist[nIdx]);
        } else if (flags[nIdx] === BAND) {
          const newD = solveEikonal(nxPos, nyPos);
          if (newD < dist[nIdx]) {
            dist[nIdx] = newD;
            heap.update(nIdx, newD);
          }
        }
      }
    }

    return output;
  }

  // =========================================================================
  // 2. Navier-Stokes PDE Isophote Transport Inpainting
  // =========================================================================
  /**
   * Inpaints masked regions using 2D Navier-Stokes fluid vorticity transport PDE.
   * Propagates lines of equal brightness (isophotes) for smooth gradients and shadows.
   *
   * @param {ImageData} imageData - Target pixel buffer
   * @param {Uint8Array} binaryMask - 1-channel mask (W * H)
   * @param {number} [iterations=40] - Number of PDE diffusion steps (default 40)
   * @param {number} [dt=0.1] - Time step per iteration (default 0.1)
   * @returns {ImageData} Inpainted image data
   */
  function inpaintNavierStokes(imageData, binaryMask, iterations = 40, dt = 0.1) {
    const W = imageData.width;
    const H = imageData.height;
    const N = W * H;
    const output = cloneImageData(imageData);
    const data = output.data;

    // Check if mask is empty
    let maskPixelCount = 0;
    for (let i = 0; i < N; i++) {
      if (binaryMask[i] > 0) maskPixelCount++;
    }
    if (maskPixelCount === 0 || maskPixelCount === N) return output;

    // Initial boundary diffusion into unknown region to give initial smooth field
    for (let ch = 0; ch < 4; ch++) {
      const channel = new Float32Array(N);

      // Compute average of known pixels adjacent to mask
      let borderSum = 0;
      let borderCount = 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = y * W + x;
          if (binaryMask[idx] === 0) {
            channel[idx] = data[(idx << 2) + ch];
            const hasMaskNeighbor =
              (x > 0 && binaryMask[idx - 1] > 0) ||
              (x < W - 1 && binaryMask[idx + 1] > 0) ||
              (y > 0 && binaryMask[idx - W] > 0) ||
              (y < H - 1 && binaryMask[idx + W] > 0);
            if (hasMaskNeighbor) {
              borderSum += channel[idx];
              borderCount++;
            }
          }
        }
      }
      const initialFill = borderCount > 0 ? borderSum / borderCount : 128;
      for (let i = 0; i < N; i++) {
        if (binaryMask[i] > 0) {
          channel[i] = initialFill;
        }
      }

      // Bidirectional Gauss-Seidel harmonic boundary diffusion (forward + backward sweeps)
      for (let initStep = 0; initStep < 35; initStep++) {
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const idx = y * W + x;
            if (binaryMask[idx] > 0) {
              channel[idx] =
                0.25 * (channel[idx - 1] + channel[idx + 1] + channel[idx - W] + channel[idx + W]);
            }
          }
        }
        for (let y = H - 2; y >= 1; y--) {
          for (let x = W - 2; x >= 1; x--) {
            const idx = y * W + x;
            if (binaryMask[idx] > 0) {
              channel[idx] =
                0.25 * (channel[idx - 1] + channel[idx + 1] + channel[idx - W] + channel[idx + W]);
            }
          }
        }
      }

      // Navier-Stokes Vorticity Transport iterations
      const laplacian = new Float32Array(N);
      for (let iter = 0; iter < iterations; iter++) {
        // Compute Laplacian: L = d^2I/dx^2 + d^2I/dy^2
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const idx = y * W + x;
            laplacian[idx] =
              channel[idx - 1] + channel[idx + 1] + channel[idx - W] + channel[idx + W] - 4 * channel[idx];
          }
        }

        // Convective transport along isophotes: v . grad(L)
        // where v = grad_perp(I) = (-dI/dy, dI/dx)
        for (let y = 2; y < H - 2; y++) {
          for (let x = 2; x < W - 2; x++) {
            const idx = y * W + x;
            if (binaryMask[idx] === 0) continue;

            const Ix = (channel[idx + 1] - channel[idx - 1]) * 0.5;
            const Iy = (channel[idx + W] - channel[idx - W]) * 0.5;

            const Lx = (laplacian[idx + 1] - laplacian[idx - 1]) * 0.5;
            const Ly = (laplacian[idx + W] - laplacian[idx - W]) * 0.5;

            // Transport term: -Iy * Lx + Ix * Ly
            const beta = -Iy * Lx + Ix * Ly;
            const gradMag = Math.hypot(Ix, Iy) + 1e-3;
            const transport = beta / gradMag;

            // Update channel: transport + small diffusion stabilization
            const dVal = dt * (transport + 0.1 * laplacian[idx]);
            channel[idx] = Math.max(0, Math.min(255, channel[idx] + dVal));
          }
        }
      }

      // Write back to output buffer
      for (let i = 0; i < N; i++) {
        if (binaryMask[i] > 0) {
          data[(i << 2) + ch] = Math.round(channel[i]);
        }
      }
    }

    return output;
  }

  // =========================================================================
  // 3. Criminisi Exemplar-Based Patch Synthesis Inpainting
  // =========================================================================
  /**
   * Inpaints masked regions using Criminisi's exemplar-based texture patch synthesis.
   * Ideal for textured backgrounds, repetitive patterns, and logo removal.
   *
   * @param {ImageData} imageData - Target pixel buffer
   * @param {Uint8Array} binaryMask - 1-channel mask (W * H)
   * @param {number} [patchRadius=4] - Radius of square patch (patch size = 2*r + 1) (default 4)
   * @param {number} [searchWindow=64] - Radius of localized search window (default 64)
   * @returns {ImageData} Inpainted image data
   */
  function inpaintExemplar(imageData, binaryMask, patchRadius = 4, searchWindow = 64) {
    const W = imageData.width;
    const H = imageData.height;
    const N = W * H;
    const output = cloneImageData(imageData);
    const data = output.data;

    // Working mask & confidence
    const mask = new Uint8Array(N);
    const confidence = new Float32Array(N);

    let targetCount = 0;
    let minX = W,
      maxX = 0,
      minY = H,
      maxY = 0;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        if (binaryMask[idx] > 0) {
          mask[idx] = 255;
          confidence[idx] = 0.0;
          targetCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        } else {
          mask[idx] = 0;
          confidence[idx] = 1.0;
        }
      }
    }

    if (targetCount === 0 || targetCount === N) return output;

    const patchSize = 2 * patchRadius + 1;
    const patchArea = patchSize * patchSize;

    // Boundary pixel queue
    const boundary = [];

    // Helper: update boundary
    function findBoundary() {
      boundary.length = 0;
      for (let y = Math.max(0, minY - 1); y <= Math.min(H - 1, maxY + 1); y++) {
        for (let x = Math.max(0, minX - 1); x <= Math.min(W - 1, maxX + 1); x++) {
          const idx = y * W + x;
          if (mask[idx] > 0) {
            const hasKnown =
              (x > 0 && mask[idx - 1] === 0) ||
              (x < W - 1 && mask[idx + 1] === 0) ||
              (y > 0 && mask[idx - W] === 0) ||
              (y < H - 1 && mask[idx + W] === 0);
            if (hasKnown) {
              boundary.push(idx);
            }
          }
        }
      }
    }

    findBoundary();

    const maxIterations = targetCount * 2;
    let iter = 0;

    while (boundary.length > 0 && iter++ < maxIterations) {
      let maxPriority = -1;
      let bestP = -1;
      let bestConfidence = 0;

      // Compute priority P(p) = C(p) * D(p) for all boundary pixels
      for (let b = 0; b < boundary.length; b++) {
        const pIdx = boundary[b];
        const px = pIdx % W;
        const py = Math.floor(pIdx / W);

        // 1. Confidence Term C(p)
        let confSum = 0;
        for (let dy = -patchRadius; dy <= patchRadius; dy++) {
          const qy = py + dy;
          if (qy < 0 || qy >= H) continue;
          for (let dx = -patchRadius; dx <= patchRadius; dx++) {
            const qx = px + dx;
            if (qx < 0 || qx >= W) continue;
            confSum += confidence[qy * W + qx];
          }
        }
        const C_p = confSum / patchArea;

        // 2. Data Term D(p) = |grad_perp(I) . n| / alpha
        // Estimate boundary normal n = (nx, ny) from mask gradient
        let mx = 0;
        let my = 0;
        if (px > 0 && px < W - 1) mx = (mask[pIdx + 1] - mask[pIdx - 1]) * 0.5;
        if (py > 0 && py < H - 1) my = (mask[pIdx + W] - mask[pIdx - W]) * 0.5;
        const mLen = Math.hypot(mx, my);
        let nx = 0,
          ny = 0;
        if (mLen > 1e-4) {
          // Normal is perpendicular to mask boundary gradient
          nx = -my / mLen;
          ny = mx / mLen;
        }

        // Estimate isophote vector grad_perp(I) = (-Iy, Ix)
        let Ix = 0,
          Iy = 0;
        if (px > 0 && px < W - 1 && mask[pIdx - 1] === 0 && mask[pIdx + 1] === 0) {
          const dR = data[(pIdx + 1) << 2] - data[(pIdx - 1) << 2];
          const dG = data[((pIdx + 1) << 2) + 1] - data[((pIdx - 1) << 2) + 1];
          const dB = data[((pIdx + 1) << 2) + 2] - data[((pIdx - 1) << 2) + 2];
          Ix = (dR + dG + dB) / 6.0;
        }
        if (py > 0 && py < H - 1 && mask[pIdx - W] === 0 && mask[pIdx + W] === 0) {
          const dR = data[(pIdx + W) << 2] - data[(pIdx - W) << 2];
          const dG = data[((pIdx + W) << 2) + 1] - data[((pIdx - W) << 2) + 1];
          const dB = data[((pIdx + W) << 2) + 2] - data[((pIdx - W) << 2) + 2];
          Iy = (dR + dG + dB) / 6.0;
        }

        // Isophote perpendicular to image gradient
        const isoX = -Iy;
        const isoY = Ix;
        const D_p = Math.abs(isoX * nx + isoY * ny) / 255.0 + 0.001;

        const priority = C_p * D_p;
        if (priority > maxPriority) {
          maxPriority = priority;
          bestP = pIdx;
          bestConfidence = C_p;
        }
      }

      if (bestP === -1) break;

      const targetX = bestP % W;
      const targetY = Math.floor(bestP / W);

      // Search localized window for matching exemplar patch minimizing SSD
      let minSSD = Infinity;
      let bestSourceX = -1;
      let bestSourceY = -1;

      const sXMin = Math.max(patchRadius, targetX - searchWindow);
      const sXMax = Math.min(W - 1 - patchRadius, targetX + searchWindow);
      const sYMin = Math.max(patchRadius, targetY - searchWindow);
      const sYMax = Math.min(H - 1 - patchRadius, targetY + searchWindow);

      // Search loop
      for (let sy = sYMin; sy <= sYMax; sy += 2) {
        for (let sx = sXMin; sx <= sXMax; sx += 2) {
          // Check if candidate source patch is completely known
          let isKnown = true;
          for (let dy = -patchRadius; dy <= patchRadius; dy += 2) {
            for (let dx = -patchRadius; dx <= patchRadius; dx += 2) {
              if (mask[(sy + dy) * W + (sx + dx)] > 0) {
                isKnown = false;
                break;
              }
            }
            if (!isKnown) break;
          }
          if (!isKnown) continue;

          // Compute Sum of Squared Differences over known pixels in target patch
          let ssd = 0;
          let count = 0;
          for (let dy = -patchRadius; dy <= patchRadius; dy++) {
            const ty = targetY + dy;
            if (ty < 0 || ty >= H) continue;
            for (let dx = -patchRadius; dx <= patchRadius; dx++) {
              const tx = targetX + dx;
              if (tx < 0 || tx >= W) continue;
              const tIdx = ty * W + tx;

              // Only compare known pixels
              if (mask[tIdx] === 0) {
                const sIdx = (sy + dy) * W + (sx + dx);
                const tOff = tIdx << 2;
                const sOff = sIdx << 2;

                const dr = data[tOff] - data[sOff];
                const dg = data[tOff + 1] - data[sOff + 1];
                const db = data[tOff + 2] - data[sOff + 2];
                ssd += dr * dr + dg * dg + db * db;
                count++;
              }
            }
          }

          if (count > 0) {
            const normSSD = ssd / count;
            if (normSSD < minSSD) {
              minSSD = normSSD;
              bestSourceX = sx;
              bestSourceY = sy;
            }
          }
        }
      }

      // If no valid exemplar in search window, fallback: diffuse color from nearest known neighbors
      if (bestSourceX === -1) {
        for (let dy = -patchRadius; dy <= patchRadius; dy++) {
          const ty = targetY + dy;
          if (ty < 0 || ty >= H) continue;
          for (let dx = -patchRadius; dx <= patchRadius; dx++) {
            const tx = targetX + dx;
            if (tx < 0 || tx >= W) continue;
            const tIdx = ty * W + tx;
            if (mask[tIdx] > 0) {
              // Inverse-distance weighted average of surrounding known pixels
              let sumR = 0, sumG = 0, sumB = 0, sumA = 0, wSum = 0;
              const maxSearch = Math.max(W, H);
              for (let r = 1; r <= maxSearch; r++) {
                for (let ry = -r; ry <= r; ry++) {
                  const ny = ty + ry;
                  if (ny < 0 || ny >= H) continue;
                  for (let rx = -r; rx <= r; rx++) {
                    if (Math.abs(rx) !== r && Math.abs(ry) !== r) continue;
                    const nx = tx + rx;
                    if (nx < 0 || nx >= W) continue;
                    const nIdx = ny * W + nx;
                    if (mask[nIdx] === 0) {
                      const off = nIdx << 2;
                      const weight = 1.0 / Math.hypot(rx, ry);
                      sumR += data[off] * weight;
                      sumG += data[off + 1] * weight;
                      sumB += data[off + 2] * weight;
                      sumA += data[off + 3] * weight;
                      wSum += weight;
                    }
                  }
                }
                if (wSum > 0) break;
              }

              if (wSum > 0) {
                const tOff = tIdx << 2;
                data[tOff] = Math.round(sumR / wSum);
                data[tOff + 1] = Math.round(sumG / wSum);
                data[tOff + 2] = Math.round(sumB / wSum);
                data[tOff + 3] = Math.round(sumA / wSum);
              }

              mask[tIdx] = 0;
              confidence[tIdx] = bestConfidence > 0 ? bestConfidence : 0.1;
            }
          }
        }
      } else {
        // Copy matching exemplar pixels to target patch
        for (let dy = -patchRadius; dy <= patchRadius; dy++) {
          const ty = targetY + dy;
          if (ty < 0 || ty >= H) continue;
          for (let dx = -patchRadius; dx <= patchRadius; dx++) {
            const tx = targetX + dx;
            if (tx < 0 || tx >= W) continue;
            const tIdx = ty * W + tx;

            if (mask[tIdx] > 0) {
              const sIdx = (bestSourceY + dy) * W + (bestSourceX + dx);
              const tOff = tIdx << 2;
              const sOff = sIdx << 2;

              data[tOff] = data[sOff];
              data[tOff + 1] = data[sOff + 1];
              data[tOff + 2] = data[sOff + 2];
              data[tOff + 3] = data[sOff + 3];

              mask[tIdx] = 0;
              confidence[tIdx] = bestConfidence;
            }
          }
        }
      }

      findBoundary();
    }

    // Final safety pass: inpaint any residual unfilled mask pixels using neighbor diffusion
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        if (mask[idx] > 0) {
          let sumR = 0, sumG = 0, sumB = 0, sumA = 0, wSum = 0;
          const maxSearch = Math.max(W, H);
          for (let r = 1; r <= maxSearch; r++) {
            for (let ry = -r; ry <= r; ry++) {
              const ny = y + ry;
              if (ny < 0 || ny >= H) continue;
              for (let rx = -r; rx <= r; rx++) {
                if (Math.abs(rx) !== r && Math.abs(ry) !== r) continue;
                const nx = x + rx;
                if (nx < 0 || nx >= W) continue;
                const nIdx = ny * W + nx;
                if (mask[nIdx] === 0) {
                  const off = nIdx << 2;
                  const weight = 1.0 / Math.hypot(rx, ry);
                  sumR += data[off] * weight;
                  sumG += data[off + 1] * weight;
                  sumB += data[off + 2] * weight;
                  sumA += data[off + 3] * weight;
                  wSum += weight;
                }
              }
            }
            if (wSum > 0) break;
          }
          if (wSum > 0) {
            const off = idx << 2;
            data[off] = Math.round(sumR / wSum);
            data[off + 1] = Math.round(sumG / wSum);
            data[off + 2] = Math.round(sumB / wSum);
            data[off + 3] = Math.round(sumA / wSum);
            mask[idx] = 0;
          }
        }
      }
    }

    return output;
  }

  // =========================================================================
  // 4. Real-Time Border-Bilinear Delogo with Edge-Preserving Blur
  // =========================================================================
  /**
   * Fast edge-weighted bilinear delogo interpolation designed for real-time video frames (< 2 ms/frame).
   * Interpolates colors inward from the 4 perimeter edges of the bounding box and blends borders.
   *
   * @param {ImageData} imageData - Target pixel buffer
   * @param {{ x: number, y: number, w: number, h: number }} box - Delogo bounding box
   * @param {number} [blurRadius=2] - Edge-preserving smoothing radius (default 2)
   * @returns {ImageData} Inpainted image data
   */
  function delogoBilinear(imageData, box, blurRadius = 2) {
    const W = imageData.width;
    const H = imageData.height;
    const output = cloneImageData(imageData);
    const data = output.data;

    // Empty/degenerate checks: if box.w <= 0 || box.h <= 0 or outside image, return unmodified cloned buffer
    if (!box || typeof box !== 'object' || box.w <= 0 || box.h <= 0 || W <= 0 || H <= 0) {
      return output;
    }

    const rawX = Math.round(box.x);
    const rawY = Math.round(box.y);
    const rawW = Math.round(box.w);
    const rawH = Math.round(box.h);

    if (rawW <= 0 || rawH <= 0 || rawX >= W || rawY >= H || rawX + rawW <= 0 || rawY + rawH <= 0) {
      return output;
    }

    // Bounds safety: clamp x1, y1, x2, y2 strictly within [0, W - 1] and [0, H - 1]
    const x1 = Math.max(0, Math.min(W - 1, rawX));
    const y1 = Math.max(0, Math.min(H - 1, rawY));
    const x2 = Math.max(x1, Math.min(W - 1, rawX + rawW - 1));
    const y2 = Math.max(y1, Math.min(H - 1, rawY + rawH - 1));
    const w = x2 - x1 + 1;
    const h = y2 - y1 + 1;

    if (w <= 0 || h <= 0) {
      return output;
    }

    // Sample row bounds: determine available exterior perimeter borders
    const hasTop = y1 > 0;
    const hasBot = y2 < H - 1;
    const hasLeft = x1 > 0;
    const hasRight = x2 < W - 1;

    const topY = hasTop ? y1 - 1 : y1;
    const botY = hasBot ? y2 + 1 : y2;
    const leftX = hasLeft ? x1 - 1 : x1;
    const rightX = hasRight ? x2 + 1 : x2;

    // Pre-cache border colors
    const topRow = new Float32Array(w * 4);
    const bottomRow = new Float32Array(w * 4);
    const leftCol = new Float32Array(h * 4);
    const rightCol = new Float32Array(h * 4);

    for (let i = 0; i < w; i++) {
      const px = x1 + i;
      const topIdx = (topY * W + px) << 2;
      const botIdx = (botY * W + px) << 2;
      const dstIdx = i << 2;
      topRow[dstIdx] = data[topIdx];
      topRow[dstIdx + 1] = data[topIdx + 1];
      topRow[dstIdx + 2] = data[topIdx + 2];
      topRow[dstIdx + 3] = data[topIdx + 3];

      bottomRow[dstIdx] = data[botIdx];
      bottomRow[dstIdx + 1] = data[botIdx + 1];
      bottomRow[dstIdx + 2] = data[botIdx + 2];
      bottomRow[dstIdx + 3] = data[botIdx + 3];
    }

    for (let j = 0; j < h; j++) {
      const py = y1 + j;
      const leftIdx = (py * W + leftX) << 2;
      const rightIdx = (py * W + rightX) << 2;
      const dstIdx = j << 2;
      leftCol[dstIdx] = data[leftIdx];
      leftCol[dstIdx + 1] = data[leftIdx + 1];
      leftCol[dstIdx + 2] = data[leftIdx + 2];
      leftCol[dstIdx + 3] = data[leftIdx + 3];

      rightCol[dstIdx] = data[rightIdx];
      rightCol[dstIdx + 1] = data[rightIdx + 1];
      rightCol[dstIdx + 2] = data[rightIdx + 2];
      rightCol[dstIdx + 3] = data[rightIdx + 3];
    }

    // Bilinear distance-weighted interpolation with conditional border weighting
    for (let j = 0; j < h; j++) {
      const py = y1 + j;
      const dT = j + 1;
      const dB = h - j;
      const wT = hasTop ? (1.0 / dT) : 0;
      const wB = hasBot ? (1.0 / dB) : 0;
      const leftOff = j << 2;
      const rightOff = j << 2;

      for (let i = 0; i < w; i++) {
        const px = x1 + i;
        const dL = i + 1;
        const dR = w - i;
        const wL = hasLeft ? (1.0 / dL) : 0;
        const wR = hasRight ? (1.0 / dR) : 0;

        const wSum = wL + wR + wT + wB;
        const topOff = i << 2;
        const botOff = i << 2;

        const outIdx = (py * W + px) << 2;

        if (wSum > 0) {
          for (let c = 0; c < 4; c++) {
            const val =
              wL * leftCol[leftOff + c] +
              wR * rightCol[rightOff + c] +
              wT * topRow[topOff + c] +
              wB * bottomRow[botOff + c];
            data[outIdx + c] = Math.round(val / wSum);
          }
        }
      }
    }

    // Optional edge-preserving smoothing inside box to soften borders
    if (blurRadius > 0 && w >= 4 && h >= 4) {
      const boxData = new Uint8ClampedArray(w * h * 4);
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          const srcIdx = ((y1 + j) * W + (x1 + i)) << 2;
          const dstIdx = (j * w + i) << 2;
          boxData[dstIdx] = data[srcIdx];
          boxData[dstIdx + 1] = data[srcIdx + 1];
          boxData[dstIdx + 2] = data[srcIdx + 2];
          boxData[dstIdx + 3] = data[srcIdx + 3];
        }
      }

      const r = Math.min(blurRadius, Math.floor(Math.min(w, h) / 4));
      if (r > 0) {
        for (let j = 0; j < h; j++) {
          for (let i = 0; i < w; i++) {
            // Feather blend toward edges so we don't blur with un-inpainted borders
            const edgeDist = Math.min(i, w - 1 - i, j, h - 1 - j);
            if (edgeDist < 1) continue;

          let sR = 0,
            sG = 0,
            sB = 0,
            sW = 0;
          for (let dy = -r; dy <= r; dy++) {
            const ny = j + dy;
            if (ny < 0 || ny >= h) continue;
            for (let dx = -r; dx <= r; dx++) {
              const nx = i + dx;
              if (nx < 0 || nx >= w) continue;
              const idx = (ny * w + nx) << 2;
              sR += boxData[idx];
              sG += boxData[idx + 1];
              sB += boxData[idx + 2];
              sW++;
            }
          }

          const outIdx = ((y1 + j) * W + (x1 + i)) << 2;
          data[outIdx] = Math.round(sR / sW);
          data[outIdx + 1] = Math.round(sG / sW);
          data[outIdx + 2] = Math.round(sB / sW);
        }
      }
    }
  }

  return output;
}

  // =========================================================================
  // 5. Multi-Frame Temporal Smoothing & Scene-Cut Detection
  // =========================================================================
  /**
   * Applies temporal Exponential Moving Average across video frames to prevent flickering.
   * Resets temporal state automatically if Mean Absolute Difference (MAD) indicates a scene cut.
   *
   * @param {ImageData} currentImageData - Current frame ImageData
   * @param {ImageData|null} prevImageData - Previous frame ImageData (or null if first frame)
   * @param {{ x: number, y: number, w: number, h: number }} box - Region to smooth
   * @param {number} [alpha=0.65] - Current frame weight (default 0.65)
   * @param {number} [sceneCutThreshold=25.0] - MAD threshold to trigger scene cut reset
   * @returns {{ imageData: ImageData, isSceneCut: boolean }} Smoothed frame and scene cut flag
   */
  function temporalSmooth(
    currentImageData,
    prevImageData,
    box,
    alpha = 0.65,
    sceneCutThreshold = 25.0
  ) {
    const W = currentImageData.width;
    const H = currentImageData.height;
    const output = cloneImageData(currentImageData);

    if (!prevImageData) {
      return { imageData: output, isSceneCut: true };
    }

    const curData = currentImageData.data;
    const prevData = prevImageData.data;
    const outData = output.data;

    const x1 = Math.max(0, Math.min(W - 1, Math.round(box.x)));
    const y1 = Math.max(0, Math.min(H - 1, Math.round(box.y)));
    const w = Math.max(1, Math.min(W - x1, Math.round(box.w)));
    const h = Math.max(1, Math.min(H - y1, Math.round(box.h)));
    const x2 = x1 + w - 1;
    const y2 = y1 + h - 1;

    // 1. Scene-Cut Detection: Compute border perimeter MAD
    let diffSum = 0;
    let perimeterCount = 0;

    // Top and Bottom borders
    for (let x = x1; x <= x2; x++) {
      const topIdx = (y1 * W + x) << 2;
      const botIdx = (y2 * W + x) << 2;
      diffSum +=
        Math.abs(curData[topIdx] - prevData[topIdx]) +
        Math.abs(curData[topIdx + 1] - prevData[topIdx + 1]) +
        Math.abs(curData[topIdx + 2] - prevData[topIdx + 2]);
      diffSum +=
        Math.abs(curData[botIdx] - prevData[botIdx]) +
        Math.abs(curData[botIdx + 1] - prevData[botIdx + 1]) +
        Math.abs(curData[botIdx + 2] - prevData[botIdx + 2]);
      perimeterCount += 2;
    }

    // Left and Right borders
    for (let y = y1 + 1; y < y2; y++) {
      const leftIdx = (y * W + x1) << 2;
      const rightIdx = (y * W + x2) << 2;
      diffSum +=
        Math.abs(curData[leftIdx] - prevData[leftIdx]) +
        Math.abs(curData[leftIdx + 1] - prevData[leftIdx + 1]) +
        Math.abs(curData[leftIdx + 2] - prevData[leftIdx + 2]);
      diffSum +=
        Math.abs(curData[rightIdx] - prevData[rightIdx]) +
        Math.abs(curData[rightIdx + 1] - prevData[rightIdx + 1]) +
        Math.abs(curData[rightIdx + 2] - prevData[rightIdx + 2]);
      perimeterCount += 2;
    }

    const mad = perimeterCount > 0 ? diffSum / (perimeterCount * 3) : 0;
    const isSceneCut = mad > sceneCutThreshold;

    if (isSceneCut) {
      // Scene cut: don't blend with previous frame
      return { imageData: output, isSceneCut: true };
    }

    // 2. Exponential Moving Average blend across interior
    const beta = 1.0 - alpha;
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const idx = (y * W + x) << 2;
        outData[idx] = Math.round(alpha * curData[idx] + beta * prevData[idx]);
        outData[idx + 1] = Math.round(alpha * curData[idx + 1] + beta * prevData[idx + 1]);
        outData[idx + 2] = Math.round(alpha * curData[idx + 2] + beta * prevData[idx + 2]);
        outData[idx + 3] = curData[idx + 3];
      }
    }

    return { imageData: output, isSceneCut: false };
  }

  // =========================================================================
  // 6. Interactive Selection Subsystem (Dual Mode: Bounding Box & Bezier Brush)
  // =========================================================================
  /**
   * Creates an interactive selection controller supporting both 8-handle Bounding Box
   * and Freehand Brush with quadratic Bezier smoothing and unified 1-channel mask output.
   *
   * @param {HTMLElement|HTMLCanvasElement} containerOrCanvas - Container element or canvas
   * @param {Object} [options] - Configuration options
   * @returns {Object} Selection controller API
   */
  function createSelectionController(containerOrCanvas, options = {}) {
    let mode = options.mode || 'box'; // 'box' | 'brush'
    let brushSize = 32;
    if (options.brushSize !== undefined && options.brushSize !== null) {
      const parsed = Number(options.brushSize);
      brushSize = Math.max(1, Math.abs(isNaN(parsed) ? 32 : parsed));
    }
    let brushRadius = brushSize / 2;
    let isEraser = false;
    let onSelectionChange = options.onSelectionChange || null;

    // Normalized bounding box [0..1]
    let boxNorm = options.initialBox || { x: 0.1, y: 0.1, w: 0.4, h: 0.2 };
    let activeHandle = null;
    let isDraggingBox = false;
    let dragStart = { x: 0, y: 0 };
    let initialBoxNorm = { ...boxNorm };

    // Canvas references
    let baseCanvas = null;
    let overlayCanvas = null;
    let cursorCanvas = null;
    let overlayCtx = null;
    let cursorCtx = null;
    let container = null;

    // Event listener references for clean removal in destroy()
    let handlePointerDown = null;
    let handlePointerMove = null;
    let handlePointerUp = null;

    // Stroke tracking
    let isDrawing = false;
    let strokePoints = [];
    const undoStack = [];
    const maxUndo = 25;

    // Set up DOM elements if in browser
    if (typeof document !== 'undefined') {
      if (containerOrCanvas instanceof HTMLCanvasElement) {
        baseCanvas = containerOrCanvas;
        container = baseCanvas.parentElement;
      } else if (containerOrCanvas && containerOrCanvas.nodeType === 1) {
        container = containerOrCanvas;
        baseCanvas = container.querySelector('canvas') || null;
      }

      if (container) {
        container.style.position = container.style.position || 'relative';
        container.style.userSelect = 'none';
        container.style.touchAction = 'none';

        // Create overlay canvas for brush mask and box handles
        overlayCanvas = document.createElement('canvas');
        overlayCanvas.className = 'selection-overlay-canvas';
        overlayCanvas.style.position = 'absolute';
        overlayCanvas.style.left = '0';
        overlayCanvas.style.top = '0';
        overlayCanvas.style.width = '100%';
        overlayCanvas.style.height = '100%';
        overlayCanvas.style.pointerEvents = 'auto';
        overlayCanvas.style.zIndex = '10';
        container.appendChild(overlayCanvas);
        overlayCtx = overlayCanvas.getContext('2d');

        // Create follower cursor canvas
        cursorCanvas = document.createElement('canvas');
        cursorCanvas.className = 'selection-cursor-canvas';
        cursorCanvas.style.position = 'absolute';
        cursorCanvas.style.left = '0';
        cursorCanvas.style.top = '0';
        cursorCanvas.style.width = '100%';
        cursorCanvas.style.height = '100%';
        cursorCanvas.style.pointerEvents = 'none';
        cursorCanvas.style.zIndex = '11';
        container.appendChild(cursorCanvas);
        cursorCtx = cursorCanvas.getContext('2d');

        syncCanvasDimensions();
        attachEventListeners();
        render();
      }
    }

    function syncCanvasDimensions() {
      if (!baseCanvas || !overlayCanvas) return;
      const w = baseCanvas.width;
      const h = baseCanvas.height;
      if (overlayCanvas.width !== w || overlayCanvas.height !== h) {
        overlayCanvas.width = w;
        overlayCanvas.height = h;
      }
      if (cursorCanvas && (cursorCanvas.width !== w || cursorCanvas.height !== h)) {
        cursorCanvas.width = w;
        cursorCanvas.height = h;
      }
    }

    function getPointerPos(e) {
      if (!overlayCanvas) return { x: 0, y: 0, normX: 0, normY: 0 };
      const rect = overlayCanvas.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      const normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      const px = Math.round(normX * overlayCanvas.width);
      const py = Math.round(normY * overlayCanvas.height);
      return { x: px, y: py, normX, normY };
    }

    // Hit-testing 8 bounding box control handles
    function hitTestHandles(px, py) {
      if (!overlayCanvas) return null;
      const W = overlayCanvas.width;
      const H = overlayCanvas.height;
      const bx = boxNorm.x * W;
      const by = boxNorm.y * H;
      const bw = boxNorm.w * W;
      const bh = boxNorm.h * H;
      const handleSize = 14;

      const handles = {
        nw: { x: bx, y: by },
        n: { x: bx + bw / 2, y: by },
        ne: { x: bx + bw, y: by },
        e: { x: bx + bw, y: by + bh / 2 },
        se: { x: bx + bw, y: by + bh },
        s: { x: bx + bw / 2, y: by + bh },
        sw: { x: bx, y: by + bh },
        w: { x: bx, y: by + bh / 2 }
      };

      for (const [key, pt] of Object.entries(handles)) {
        if (Math.abs(px - pt.x) <= handleSize && Math.abs(py - pt.y) <= handleSize) {
          return key;
        }
      }

      // Check inside body
      if (px >= bx && px <= bx + bw && py >= by && py <= by + bh) {
        return 'body';
      }

      return null;
    }

    function pushUndoSnapshot() {
      if (!overlayCtx || !overlayCanvas) return;
      const snapshot = overlayCtx.getImageData(0, 0, overlayCanvas.width, overlayCanvas.height);
      undoStack.push(snapshot);
      if (undoStack.length > maxUndo) undoStack.shift();
    }

    function render() {
      if (!overlayCtx || !overlayCanvas) return;
      syncCanvasDimensions();
      const W = overlayCanvas.width;
      const H = overlayCanvas.height;

      if (mode === 'box') {
        overlayCtx.clearRect(0, 0, W, H);

        const bx = Math.round(boxNorm.x * W);
        const by = Math.round(boxNorm.y * H);
        const bw = Math.round(boxNorm.w * W);
        const bh = Math.round(boxNorm.h * H);

        // Darkened backdrop outside box
        overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        overlayCtx.beginPath();
        overlayCtx.rect(0, 0, W, H);
        overlayCtx.rect(bx, by, bw, bh);
        overlayCtx.fill('evenodd');

        // Bounding box fill & dashed border
        overlayCtx.fillStyle = 'rgba(59, 130, 246, 0.22)';
        overlayCtx.fillRect(bx, by, bw, bh);

        overlayCtx.strokeStyle = '#3b82f6';
        overlayCtx.lineWidth = 2;
        overlayCtx.setLineDash([6, 4]);
        overlayCtx.strokeRect(bx, by, bw, bh);
        overlayCtx.setLineDash([]);

        // 8 Control handles
        const hs = 9;
        overlayCtx.fillStyle = '#ffffff';
        overlayCtx.strokeStyle = '#2563eb';
        overlayCtx.lineWidth = 2;

        const handles = [
          [bx, by],
          [bx + bw / 2, by],
          [bx + bw, by],
          [bx + bw, by + bh / 2],
          [bx + bw, by + bh],
          [bx + bw / 2, by + bh],
          [bx, by + bh],
          [bx, by + bh / 2]
        ];

        for (const [hx, hy] of handles) {
          overlayCtx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
          overlayCtx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
        }

        // Live dimension badge
        const badgeText = `${bw} × ${bh} px`;
        overlayCtx.font = 'bold 12px sans-serif';
        const textMetrics = overlayCtx.measureText(badgeText);
        const badgeW = textMetrics.width + 12;
        const badgeH = 22;
        const badgeX = Math.max(4, Math.min(W - badgeW - 4, bx));
        const badgeY = by > 26 ? by - 26 : by + bh + 6;

        overlayCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        overlayCtx.beginPath();
        overlayCtx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
        overlayCtx.fill();

        overlayCtx.fillStyle = '#38bdf8';
        overlayCtx.textAlign = 'left';
        overlayCtx.textBaseline = 'middle';
        overlayCtx.fillText(badgeText, badgeX + 6, badgeY + badgeH / 2);
      }
    }

    function renderCursor(px, py) {
      if (!cursorCtx || !cursorCanvas) return;
      cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      if (mode !== 'brush') return;

      cursorCtx.beginPath();
      cursorCtx.arc(px, py, brushRadius, 0, Math.PI * 2);
      cursorCtx.strokeStyle = isEraser ? '#ef4444' : '#38bdf8';
      cursorCtx.lineWidth = 2;
      cursorCtx.stroke();

      cursorCtx.beginPath();
      cursorCtx.arc(px, py, 2, 0, Math.PI * 2);
      cursorCtx.fillStyle = '#ffffff';
      cursorCtx.fill();
    }

    function attachEventListeners() {
      if (!overlayCanvas) return;

      handlePointerDown = (e) => {
        syncCanvasDimensions();
        const pos = getPointerPos(e);

        if (mode === 'box') {
          const hit = hitTestHandles(pos.x, pos.y);
          if (hit) {
            if (overlayCanvas.setPointerCapture) overlayCanvas.setPointerCapture(e.pointerId);
            activeHandle = hit;
            isDraggingBox = true;
            dragStart = { x: pos.normX, y: pos.normY };
            initialBoxNorm = { ...boxNorm };
          }
        } else if (mode === 'brush') {
          pushUndoSnapshot();
          isDrawing = true;
          strokePoints = [{ x: pos.x, y: pos.y }];

          overlayCtx.save();
          overlayCtx.lineCap = 'round';
          overlayCtx.lineJoin = 'round';
          overlayCtx.lineWidth = brushRadius * 2;
          if (isEraser) {
            overlayCtx.globalCompositeOperation = 'destination-out';
          } else {
            overlayCtx.globalCompositeOperation = 'source-over';
            overlayCtx.fillStyle = 'rgba(239, 68, 68, 0.65)';
            overlayCtx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
          }

          // Single dot
          overlayCtx.beginPath();
          overlayCtx.arc(pos.x, pos.y, brushRadius, 0, Math.PI * 2);
          overlayCtx.fill();
          overlayCtx.restore();

          if (onSelectionChange) onSelectionChange();
        }
      };

      handlePointerMove = (e) => {
        const pos = getPointerPos(e);
        renderCursor(pos.x, pos.y);

        if (mode === 'box') {
          if (!isDraggingBox) {
            // Update cursor based on hover
            const hit = hitTestHandles(pos.x, pos.y);
            const cursorMap = {
              nw: 'nwse-resize',
              se: 'nwse-resize',
              ne: 'nesw-resize',
              sw: 'nesw-resize',
              n: 'ns-resize',
              s: 'ns-resize',
              e: 'ew-resize',
              w: 'ew-resize',
              body: 'move'
            };
            overlayCanvas.style.cursor = hit ? cursorMap[hit] || 'default' : 'crosshair';
            return;
          }

          const dx = pos.normX - dragStart.x;
          const dy = pos.normY - dragStart.y;
          const minW = 20 / overlayCanvas.width;
          const minH = 20 / overlayCanvas.height;

          const b = { ...initialBoxNorm };

          if (activeHandle === 'body') {
            b.x = Math.max(0, Math.min(1 - b.w, initialBoxNorm.x + dx));
            b.y = Math.max(0, Math.min(1 - b.h, initialBoxNorm.y + dy));
          } else {
            if (activeHandle.includes('w')) {
              const newX = Math.max(0, Math.min(initialBoxNorm.x + initialBoxNorm.w - minW, initialBoxNorm.x + dx));
              b.w = initialBoxNorm.x + initialBoxNorm.w - newX;
              b.x = newX;
            }
            if (activeHandle.includes('e')) {
              b.w = Math.max(minW, Math.min(1 - initialBoxNorm.x, initialBoxNorm.w + dx));
            }
            if (activeHandle.includes('n')) {
              const newY = Math.max(0, Math.min(initialBoxNorm.y + initialBoxNorm.h - minH, initialBoxNorm.y + dy));
              b.h = initialBoxNorm.y + initialBoxNorm.h - newY;
              b.y = newY;
            }
            if (activeHandle.includes('s')) {
              b.h = Math.max(minH, Math.min(1 - initialBoxNorm.y, initialBoxNorm.h + dy));
            }
          }

          boxNorm = b;
          render();
          if (onSelectionChange) onSelectionChange();
        } else if (mode === 'brush' && isDrawing) {
          strokePoints.push({ x: pos.x, y: pos.y });

          overlayCtx.save();
          overlayCtx.lineCap = 'round';
          overlayCtx.lineJoin = 'round';
          overlayCtx.lineWidth = brushRadius * 2;

          if (isEraser) {
            overlayCtx.globalCompositeOperation = 'destination-out';
            overlayCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
          } else {
            overlayCtx.globalCompositeOperation = 'source-over';
            overlayCtx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
          }

          if (strokePoints.length === 2) {
            // 2-point stroke: connect p0 to p1
            const p0 = strokePoints[0];
            const p1 = strokePoints[1];
            overlayCtx.beginPath();
            overlayCtx.moveTo(p0.x, p0.y);
            overlayCtx.lineTo(p1.x, p1.y);
            overlayCtx.stroke();
          } else if (strokePoints.length === 3) {
            // Connect p1 to mid2
            const p1 = strokePoints[1];
            const p2 = strokePoints[2];
            const mid2X = (p1.x + p2.x) / 2;
            const mid2Y = (p1.y + p2.y) / 2;
            overlayCtx.beginPath();
            overlayCtx.moveTo(p1.x, p1.y);
            overlayCtx.lineTo(mid2X, mid2Y);
            overlayCtx.stroke();
          } else if (strokePoints.length > 3) {
            // Quadratic Bezier Curve Smoothing
            const p0 = strokePoints[strokePoints.length - 3];
            const p1 = strokePoints[strokePoints.length - 2];
            const p2 = strokePoints[strokePoints.length - 1];

            const mid1X = (p0.x + p1.x) / 2;
            const mid1Y = (p0.y + p1.y) / 2;
            const mid2X = (p1.x + p2.x) / 2;
            const mid2Y = (p1.y + p2.y) / 2;

            overlayCtx.beginPath();
            overlayCtx.moveTo(mid1X, mid1Y);
            overlayCtx.quadraticCurveTo(p1.x, p1.y, mid2X, mid2Y);
            overlayCtx.stroke();
          }
          overlayCtx.restore();

          if (onSelectionChange) onSelectionChange();
        }
      };

      handlePointerUp = (e) => {
        if (mode === 'box' && isDraggingBox) {
          isDraggingBox = false;
          activeHandle = null;
          if (overlayCanvas.releasePointerCapture && e.pointerId) {
            try {
              overlayCanvas.releasePointerCapture(e.pointerId);
            } catch (_) {}
          }
          render();
          if (onSelectionChange) onSelectionChange();
        } else if (mode === 'brush' && isDrawing) {
          if (strokePoints.length >= 2) {
            const pPrev = strokePoints[strokePoints.length - 2];
            const pLast = strokePoints[strokePoints.length - 1];
            overlayCtx.save();
            overlayCtx.lineCap = 'round';
            overlayCtx.lineJoin = 'round';
            overlayCtx.lineWidth = brushRadius * 2;
            if (isEraser) {
              overlayCtx.globalCompositeOperation = 'destination-out';
              overlayCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
            } else {
              overlayCtx.globalCompositeOperation = 'source-over';
              overlayCtx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
            }
            overlayCtx.beginPath();
            if (strokePoints.length > 2) {
              overlayCtx.moveTo((pPrev.x + pLast.x) / 2, (pPrev.y + pLast.y) / 2);
            } else {
              overlayCtx.moveTo(pPrev.x, pPrev.y);
            }
            overlayCtx.lineTo(pLast.x, pLast.y);
            overlayCtx.stroke();
            overlayCtx.restore();
          }
          isDrawing = false;
          strokePoints = [];
          if (onSelectionChange) onSelectionChange();
        }
      };

      overlayCanvas.addEventListener('pointerdown', handlePointerDown);
      if (typeof window !== 'undefined') {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
      }
    }

    return {
      setMode(newMode) {
        if (newMode !== 'box' && newMode !== 'brush') return;
        mode = newMode;
        if (overlayCanvas) {
          overlayCanvas.style.cursor = mode === 'brush' ? 'none' : 'crosshair';
          render();
        }
        if (onSelectionChange) onSelectionChange();
      },

      getMode() {
        return mode;
      },

      setBrushSize(px) {
        const parsed = Number(px);
        const size = Math.max(1, Math.abs(isNaN(parsed) ? 32 : parsed));
        brushRadius = size / 2;
      },

      getBrushSize() {
        return brushRadius * 2;
      },

      setEraser(enabled) {
        isEraser = !!enabled;
      },

      isEraser() {
        return isEraser;
      },

      setBoundingBox(norm) {
        if (!norm || typeof norm !== 'object') return;
        const clampedX = Math.max(0, Math.min(1, Number(norm.x) || 0));
        const clampedY = Math.max(0, Math.min(1, Number(norm.y) || 0));
        const clampedW = Math.max(0, Math.min(1 - clampedX, Number(norm.w) || 0));
        const clampedH = Math.max(0, Math.min(1 - clampedY, Number(norm.h) || 0));
        boxNorm = {
          x: clampedX,
          y: clampedY,
          w: clampedW,
          h: clampedH
        };
        render();
        if (onSelectionChange) onSelectionChange();
      },

      getBoundingBox(targetWidth, targetHeight) {
        const W = targetWidth || (overlayCanvas ? overlayCanvas.width : 100);
        const H = targetHeight || (overlayCanvas ? overlayCanvas.height : 100);
        return {
          x: Math.round(boxNorm.x * W),
          y: Math.round(boxNorm.y * H),
          w: Math.round(boxNorm.w * W),
          h: Math.round(boxNorm.h * H),
          normalized: { ...boxNorm }
        };
      },

      /**
       * Returns a unified 1-channel binary mask (Uint8Array of size W * H)
       * where 255 = target removal area, 0 = preserved background.
       */
      getBinaryMask(targetWidth, targetHeight) {
        const W = targetWidth || (overlayCanvas ? overlayCanvas.width : 100);
        const H = targetHeight || (overlayCanvas ? overlayCanvas.height : 100);
        const mask = new Uint8Array(W * H);

        if (mode === 'box') {
          const bx = Math.max(0, Math.min(W - 1, Math.round(boxNorm.x * W)));
          const by = Math.max(0, Math.min(H - 1, Math.round(boxNorm.y * H)));
          const bw = Math.max(1, Math.min(W - bx, Math.round(boxNorm.w * W)));
          const bh = Math.max(1, Math.min(H - by, Math.round(boxNorm.h * H)));

          for (let y = by; y < by + bh; y++) {
            const rowOffset = y * W;
            for (let x = bx; x < bx + bw; x++) {
              mask[rowOffset + x] = 255;
            }
          }
        } else if (mode === 'brush' && overlayCanvas && overlayCtx) {
          let sourceCanvas = overlayCanvas;
          // Scale to target dimensions if needed
          if (overlayCanvas.width !== W || overlayCanvas.height !== H) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = W;
            tempCanvas.height = H;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(overlayCanvas, 0, 0, W, H);
            sourceCanvas = tempCanvas;
          }

          const ctx = sourceCanvas.getContext('2d');
          const imgData = ctx.getImageData(0, 0, W, H).data;
          for (let i = 0, j = 0; i < imgData.length; i += 4, j++) {
            mask[j] = imgData[i + 3] > 20 ? 255 : 0;
          }
        }

        return mask;
      },

      clear() {
        if (overlayCtx && overlayCanvas) {
          pushUndoSnapshot();
          overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          render();
        }
        if (onSelectionChange) onSelectionChange();
      },

      setMask(binaryMask, maskWidth, maskHeight) {
        if (!overlayCanvas || !overlayCtx || !binaryMask) return;
        const W = overlayCanvas.width;
        const H = overlayCanvas.height;
        pushUndoSnapshot();
        overlayCtx.clearRect(0, 0, W, H);
        const tempImgData = overlayCtx.createImageData(W, H);
        const data = tempImgData.data;
        const mW = maskWidth || W;
        const mH = maskHeight || H;
        const scaleX = mW / W;
        const scaleY = mH / H;
        for (let y = 0; y < H; y++) {
          const srcY = Math.min(mH - 1, Math.floor(y * scaleY));
          const srcRow = srcY * mW;
          for (let x = 0; x < W; x++) {
            const srcX = Math.min(mW - 1, Math.floor(x * scaleX));
            if (binaryMask[srcRow + srcX] > 0) {
              const idx = (y * W + x) << 2;
              data[idx] = 239;     // R
              data[idx + 1] = 68;  // G
              data[idx + 2] = 68;  // B
              data[idx + 3] = 165; // Alpha highlight
            }
          }
        }
        overlayCtx.putImageData(tempImgData, 0, 0);
        mode = 'brush';
        render();
        if (onSelectionChange) onSelectionChange();
      },

      undo() {
        if (undoStack.length > 0 && overlayCtx && overlayCanvas) {
          const snapshot = undoStack.pop();
          overlayCtx.putImageData(snapshot, 0, 0);
          if (onSelectionChange) onSelectionChange();
        }
      },

      onSelectionChange(callback) {
        onSelectionChange = callback;
      },

      render() {
        render();
      },

      destroy() {
        if (overlayCanvas && handlePointerDown) {
          overlayCanvas.removeEventListener('pointerdown', handlePointerDown);
        }
        if (typeof window !== 'undefined') {
          if (handlePointerMove) window.removeEventListener('pointermove', handlePointerMove);
          if (handlePointerUp) window.removeEventListener('pointerup', handlePointerUp);
        }
        if (overlayCanvas && overlayCanvas.parentElement) {
          overlayCanvas.parentElement.removeChild(overlayCanvas);
        }
        if (cursorCanvas && cursorCanvas.parentElement) {
          cursorCanvas.parentElement.removeChild(cursorCanvas);
        }
      }
    };
  }

  // =========================================================================
  // 7. Video Processing & Audio Pipeline
  // =========================================================================
  /**
   * Deterministic frame-accurate video processing pipeline using HTMLVideoElement 'seeked' loop.
   * Inpaints region on every frame, preserves original audio, and records to WebM.
   *
   * @param {Object} options - Video processing options
   * @param {HTMLVideoElement} options.videoElement - Source HTMLVideoElement
   * @param {HTMLCanvasElement} options.renderCanvas - Offscreen/render canvas
   * @param {Object} options.region - Bounding box or mask to remove { x, y, w, h }
   * @param {string} [options.algorithm='delogo'] - 'delogo' | 'telea' | 'ns' | 'exemplar'
   * @param {number} [options.fps=30] - Frame rate
   * @param {boolean} [options.temporalSmoothing=true] - Enable multi-frame temporal smoothing
   * @param {Function} [options.onProgress] - ({ currentFrame, totalFrames, percent }) => void
   * @param {Function} [options.onComplete] - ({ blob, url }) => void
   * @param {Function} [options.onError] - (error) => void
   * @returns {{ cancel: () => void }} Controller with cancel()
   */
  function processVideo(options) {
    let isCancelled = false;

    async function runPipeline() {
      const {
        videoElement,
        renderCanvas,
        region: optRegion,
        mask: optMask,
        algorithm = 'delogo',
        fps = 30,
        temporalSmoothing = true,
        onProgress = null,
        onComplete = null,
        onError = null
      } = options;

      let region = optRegion;

      try {
        if (!videoElement || !renderCanvas) {
          throw new Error('Video element and render canvas are required.');
        }

        let duration = videoElement.duration;
        if (!isFinite(duration) || duration <= 0) {
          console.warn('Video duration is non-finite or non-positive. Querying seekable/buffered ranges.');
          if (videoElement.seekable && videoElement.seekable.length > 0) {
            duration = videoElement.seekable.end(videoElement.seekable.length - 1);
          } else if (videoElement.buffered && videoElement.buffered.length > 0) {
            duration = videoElement.buffered.end(videoElement.buffered.length - 1);
          }
          if (!isFinite(duration) || duration <= 0) {
            duration = 30.0;
          }
        }

        const W = videoElement.videoWidth || 640;
        const H = videoElement.videoHeight || 360;
        renderCanvas.width = W;
        renderCanvas.height = H;
        const ctx = renderCanvas.getContext('2d', { willReadFrequently: true });

        // Resolve region from mask if region was not explicitly provided
        if (!region && optMask) {
          let minX = W, minY = H, maxX = 0, maxY = 0;
          for (let y = 0; y < H; y++) {
            const row = y * W;
            for (let x = 0; x < W; x++) {
              if (optMask[row + x] === 255) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
          if (minX <= maxX) {
            region = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
          } else {
            region = { x: 0, y: 0, w: 1, h: 1 };
          }
        } else if (!region) {
          region = { x: 0, y: 0, w: 1, h: 1 };
        }

        const validFps = Math.max(1, Math.min(60, Number(fps) || 30));
        const totalFrames = Math.max(1, Math.floor(duration * validFps));
        const dt = 1.0 / validFps;

        // Set up MediaStream and MediaRecorder
        const canvasStream = renderCanvas.captureStream(validFps);
        let audioTracks = [];

        // Audio track preservation via Web Audio API (with MediaElementSource node caching)
        let audioCtx = null;
        try {
          if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!videoElement._audioCtx || videoElement._audioCtx.state === 'closed') {
              videoElement._audioCtx = new AudioContextClass();
            }
            audioCtx = videoElement._audioCtx;
            if (audioCtx.state === 'suspended') {
              audioCtx.resume().catch(() => {});
            }

            if (!videoElement._audioSourceNode || videoElement._audioSourceNode.context !== audioCtx) {
              videoElement._audioSourceNode = audioCtx.createMediaElementSource(videoElement);
            }
            const sourceNode = videoElement._audioSourceNode;
            const destNode = audioCtx.createMediaStreamDestination();
            sourceNode.connect(destNode);
            audioTracks = destNode.stream.getAudioTracks();
          }
        } catch (audioErr) {
          console.warn('Audio capture warning:', audioErr);
          // Fallback if audio capture fails or already connected
        }

        const tracks = [...canvasStream.getVideoTracks(), ...audioTracks];
        const combinedStream = new MediaStream(tracks);

        // MIME negotiation across WebM and MP4 codecs
        const candidateMimeTypes = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm;codecs=h264',
          'video/webm',
          'video/mp4;codecs=avc1',
          'video/mp4',
          ''
        ];
        let mimeType = '';
        if (typeof MediaRecorder !== 'undefined') {
          for (const candidate of candidateMimeTypes) {
            if (!candidate || (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidate))) {
              mimeType = candidate;
              break;
            }
          }
        }

        const recordedChunks = [];
        const recorderOptions = mimeType ? { mimeType } : undefined;
        const recorder = new MediaRecorder(combinedStream, recorderOptions);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) recordedChunks.push(e.data);
        };
        recorder.start();

        let prevImageData = null;
        videoElement.pause();

        // Helper: seek to timestamp and await seeked event (with immediate resolution & 250ms fallback)
        function seekTo(time) {
          return new Promise((resolve, reject) => {
            if (Math.abs(videoElement.currentTime - time) < 0.001) {
              resolve();
              return;
            }

            let settled = false;
            let timer = null;

            const cleanup = () => {
              settled = true;
              if (timer) clearTimeout(timer);
              videoElement.removeEventListener('seeked', onSeeked);
              videoElement.removeEventListener('error', onErr);
            };

            const onSeeked = () => {
              if (settled) return;
              cleanup();
              resolve();
            };

            const onErr = (err) => {
              if (settled) return;
              cleanup();
              reject(err);
            };

            timer = setTimeout(() => {
              if (settled) return;
              cleanup();
              resolve(); // 250ms fallback timeout so non-firing seeked events never hang
            }, 250);

            videoElement.addEventListener('seeked', onSeeked);
            videoElement.addEventListener('error', onErr);
            videoElement.currentTime = time;
          });
        }

        // Frame-accurate loop
        for (let frame = 0; frame < totalFrames; frame++) {
          if (isCancelled) {
            recorder.stop();
            return;
          }

          const targetTime = Math.min(duration, frame * dt);
          await seekTo(targetTime);

          // Render current video frame to canvas
          ctx.drawImage(videoElement, 0, 0, W, H);
          let frameImage = ctx.getImageData(0, 0, W, H);

          // Apply inpainting on region
          if (algorithm === 'delogo') {
            frameImage = delogoBilinear(frameImage, region);
          } else {
            // Mask-based algorithms
            const mask = optMask ? optMask : new Uint8Array(W * H);
            if (!optMask) {
              const bx = Math.max(0, Math.min(W - 1, Math.round(region.x)));
              const by = Math.max(0, Math.min(H - 1, Math.round(region.y)));
              const bw = Math.max(1, Math.min(W - bx, Math.round(region.w)));
              const bh = Math.max(1, Math.min(H - by, Math.round(region.h)));

              for (let y = by; y < by + bh; y++) {
                const row = y * W;
                for (let x = bx; x < bx + bw; x++) {
                  mask[row + x] = 255;
                }
              }
            }

            if (algorithm === 'telea') {
              frameImage = inpaintTelea(frameImage, mask);
            } else if (algorithm === 'ns') {
              frameImage = inpaintNavierStokes(frameImage, mask, 20);
            } else if (algorithm === 'exemplar') {
              frameImage = inpaintExemplar(frameImage, mask, 3, 32);
            }
          }

          // Multi-frame temporal smoothing
          if (temporalSmoothing) {
            const smoothed = temporalSmooth(frameImage, prevImageData, region, 0.65);
            frameImage = smoothed.imageData;
            prevImageData = frameImage;
          }

          ctx.putImageData(frameImage, 0, 0);

          if (onProgress) {
            const percent = Math.round(((frame + 1) / totalFrames) * 100);
            onProgress({
              currentFrame: frame + 1,
              totalFrames,
              percent,
              currentTime: targetTime,
              duration
            });
          }
        }

        // Finalize recording
        recorder.onstop = () => {
          const blobType = mimeType || 'video/webm';
          const blob = new Blob(recordedChunks, { type: blobType });
          const url = URL.createObjectURL(blob);
          if (onComplete) onComplete({ blob, url });
        };
        recorder.stop();
      } catch (err) {
        if (onError) onError(err);
      }
    }

    runPipeline();

    return {
      cancel() {
        isCancelled = true;
      }
    };
  }

  // =========================================================================
  // 8. Built-in Procedural Synthetic Generators (Offline Testing & Demos)
  // =========================================================================
  /**
   * Procedurally creates synthetic sample photos/graphics with text/logos/watermarks
   * so users and automated tests can test offline instantly without file uploads.
   *
   * @param {string} [type='photo'] - 'photo' | 'text' | 'logo' | 'watermark'
   * @param {Object} [options] - Width, height, label overrides
   * @returns {Object} { canvas, imageData, binaryMask, box, dataUrl, getBlob }
   */
  function generateSampleImage(type = 'photo', options = {}) {
    const W = options.width || 640;
    const H = options.height || 360;

    let canvas = null;
    let ctx = null;

    if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      ctx = canvas.getContext('2d');
    }

    // Default box for watermark
    let box = {
      x: Math.round(W * 0.2),
      y: Math.round(H * 0.35),
      w: Math.round(W * 0.6),
      h: Math.round(H * 0.3)
    };

    if (type === 'logo') {
      box = {
        x: Math.round(W * 0.72),
        y: Math.round(H * 0.08),
        w: Math.round(W * 0.22),
        h: Math.round(W * 0.22)
      };
    }

    // If canvas context is available (browser), draw rich procedural artwork
    if (ctx) {
      // 1. Procedural background scenery
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.4, '#1e293b');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, '#059669');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Distant mountains
      ctx.fillStyle = '#0f766e';
      ctx.beginPath();
      ctx.moveTo(0, H * 0.7);
      ctx.lineTo(W * 0.25, H * 0.45);
      ctx.lineTo(W * 0.5, H * 0.7);
      ctx.lineTo(W * 0.75, H * 0.48);
      ctx.lineTo(W, H * 0.75);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();

      // Sun
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.35, 45, 0, Math.PI * 2);
      ctx.fill();

      // Foreground hill
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.9, W * 0.6, H * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Stamp Watermark / Logo / Text
      if (type === 'logo') {
        // Draw circular channel bug
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.beginPath();
        ctx.arc(box.x + box.w / 2, box.y + box.h / 2, box.w / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LIVE HD', box.x + box.w / 2, box.y + box.h / 2);
        ctx.restore();
      } else {
        // Draw high-contrast text watermark
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = options.text || 'CONFIDENTIAL WATERMARK';
        ctx.strokeText(text, W / 2, H / 2);
        ctx.fillText(text, W / 2, H / 2);
        ctx.restore();
      }

      const imgData = ctx.getImageData(0, 0, W, H);
      const binaryMask = new Uint8Array(W * H);

      for (let y = box.y; y < box.y + box.h; y++) {
        for (let x = box.x; x < box.x + box.w; x++) {
          if (x >= 0 && x < W && y >= 0 && y < H) {
            binaryMask[y * W + x] = 255;
          }
        }
      }

      return {
        canvas,
        imageData: imgData,
        binaryMask,
        box,
        dataUrl: canvas.toDataURL('image/png'),
        getBlob: (cb) => canvas.toBlob(cb, 'image/png')
      };
    }

    // Node.js Headless Fallback: Generate procedural pixel buffer directly
    const imgData = createImageData(W, H);
    const data = imgData.data;
    const binaryMask = new Uint8Array(W * H);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) << 2;
        // Background gradient
        data[idx] = Math.round((x / W) * 180 + 20);
        data[idx + 1] = Math.round((y / H) * 150 + 40);
        data[idx + 2] = 200;
        data[idx + 3] = 255;

        // In watermark box: stamp high contrast white logo
        if (x >= box.x && x < box.x + box.w && y >= box.y && y < box.y + box.h) {
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
          binaryMask[y * W + x] = 255;
        }
      }
    }

    return {
      canvas: null,
      imageData: imgData,
      binaryMask,
      box,
      dataUrl: null,
      getBlob: null
    };
  }

  /**
   * Procedurally generates a short animated synthetic video with a moving or static watermark
   * and records it offline to a WebM blob for instant testing.
   *
   * @param {string} [type='animated'] - 'animated' | 'static'
   * @param {Object} [options] - Configuration
   * @returns {Promise<Object>} Resolves to { blob, url, width, height, duration, box }
   */
  function generateSampleVideo(type = 'animated', options = {}) {
    return new Promise((resolve, reject) => {
      const W = options.width || 480;
      const H = options.height || 270;
      let box;
      if (type === 'logo') {
        box = { x: Math.round(W * 0.70), y: Math.round(H * 0.08), w: Math.round(W * 0.25), h: Math.round(H * 0.18) };
      } else if (type === 'text') {
        box = { x: Math.round(W * 0.10), y: Math.round(H * 0.78), w: Math.round(W * 0.80), h: Math.round(H * 0.15) };
      } else if (type === 'object') {
        box = { x: Math.round(W * 0.38), y: Math.round(H * 0.32), w: Math.round(W * 0.24), h: Math.round(H * 0.36) };
      } else {
        box = { x: Math.round(W * 0.25), y: Math.round(H * 0.35), w: Math.round(W * 0.50), h: Math.round(H * 0.25) };
      }

      if (typeof document === 'undefined' || typeof MediaRecorder === 'undefined') {
        // Node.js mock response for unit test environments
        return resolve({
          blob: null,
          url: null,
          width: W,
          height: H,
          duration: 2.0,
          box
        });
      }

      const durationSec = options.duration || 2.5;
      const fps = 30;
      const totalFrames = Math.floor(durationSec * fps);

      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(fps);
      let mimeType = 'video/webm; codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          width: W,
          height: H,
          duration: durationSec,
          box
        });
      };

      recorder.start();

      let frame = 0;
      const interval = setInterval(() => {
        if (frame >= totalFrames) {
          clearInterval(interval);
          recorder.stop();
          return;
        }

        const t = frame / totalFrames;

        // Dynamic background
        const hue = Math.round(t * 360);
        ctx.fillStyle = `hsl(${hue}, 60%, 25%)`;
        ctx.fillRect(0, 0, W, H);

        // Moving foreground shape
        const cx = (W * 0.2) + Math.sin(t * Math.PI * 4) * (W * 0.15);
        const cy = (H * 0.5) + Math.cos(t * Math.PI * 4) * (H * 0.2);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.fill();

        // Type-specific target stamp
        if (type === 'logo') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.fillRect(box.x, box.y, box.w, box.h);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.w, box.h);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('LIVE LOGO HD', box.x + box.w / 2, box.y + box.h / 2);
        } else if (type === 'text') {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(box.x, box.y, box.w, box.h);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.strokeRect(box.x, box.y, box.w, box.h);
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('[HARDCODED SUBTITLE SAMPLE]', box.x + box.w / 2, box.y + box.h / 2);
        } else if (type === 'object') {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(box.x + box.w / 2, box.y + box.h / 2, Math.min(box.w, box.h) / 2 - 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('OBJECT', box.x + box.w / 2, box.y + box.h / 2);
        } else {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.fillRect(box.x, box.y, box.w, box.h);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.w, box.h);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('DEMO WATERMARK', box.x + box.w / 2, box.y + box.h / 2);
        }

        frame++;
      }, 1000 / fps);
    });
  }

  // =========================================================================
  // 9. Automated Detection Subsystem (Text, Logos, Watermarks, Stamps)
  // =========================================================================
  /**
   * Client-side heuristic / edge-contrast / gradient / connected-components
   * text, logo, and watermark detector. 100% offline, zero dependencies.
   *
   * @param {ImageData} imageData - Target pixel buffer (width, height, data)
   * @param {Object} [options] - Detection configuration
   * @param {'text'|'logo'|'watermark'|'all'} [options.type='all'] - Mark type
   * @param {number} [options.sensitivity=0.65] - Sensitivity factor (0.1..1.0)
   * @param {number} [options.minArea=50] - Minimum bounding box area in pixels
   * @param {number} [options.maxRegions=25] - Maximum candidate boxes to return
   * @param {boolean} [options.returnMask=false] - If true, returns { regions, binaryMask }
   * @returns {Array<Object>|Object} Array of { x, y, w, h, confidence, type }
   */
  function autoDetectRegions(imageData, options = {}) {
    if (!imageData || !imageData.data || imageData.width < 8 || imageData.height < 8) {
      return options.returnMask ? { regions: [], binaryMask: new Uint8Array(0) } : [];
    }

    const { width: W, height: H, data } = imageData;
    const requestedType = options.type || 'all'; // 'text' | 'logo' | 'watermark' | 'all'
    const sensitivity = typeof options.sensitivity === 'number'
      ? Math.max(0.1, Math.min(1.0, options.sensitivity))
      : 0.65;
    const minArea = typeof options.minArea === 'number' ? Math.max(16, options.minArea) : 50;
    const maxRegions = typeof options.maxRegions === 'number' ? options.maxRegions : 25;

    // Downsample grid for performance on large images (max dimension 480)
    const maxDim = Math.max(W, H);
    const scale = maxDim > 480 ? 480 / maxDim : 1.0;
    const gW = Math.max(8, Math.round(W * scale));
    const gH = Math.max(8, Math.round(H * scale));
    const gN = gW * gH;

    const lum = new Float32Array(gN);
    const sat = new Float32Array(gN);

    for (let gy = 0; gy < gH; gy++) {
      const srcY = Math.min(H - 1, Math.floor(gy / scale));
      const gRow = gy * gW;
      const srcRow = srcY * W;
      for (let gx = 0; gx < gW; gx++) {
        const srcX = Math.min(W - 1, Math.floor(gx / scale));
        const pIdx = (srcRow + srcX) * 4;
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];
        lum[gRow + gx] = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        sat[gRow + gx] = maxC - minC;
      }
    }

    // Compute gradients (Sobel / central differences)
    const gradX = new Float32Array(gN);
    const gradY = new Float32Array(gN);
    const gradMag = new Float32Array(gN);

    let sumMag = 0;
    let countMag = 0;

    for (let y = 1; y < gH - 1; y++) {
      const row = y * gW;
      for (let x = 1; x < gW - 1; x++) {
        const idx = row + x;
        const dx = Math.abs(lum[idx + 1] - lum[idx - 1]);
        const dy = Math.abs(lum[idx + gW] - lum[idx - gW]);
        const mag = dx + dy;
        gradX[idx] = dx;
        gradY[idx] = dy;
        gradMag[idx] = mag;
        sumMag += mag;
        countMag++;
      }
    }

    const meanMag = countMag > 0 ? sumMag / countMag : 0;
    let sumSqErr = 0;
    for (let i = 0; i < gN; i++) {
      const d = gradMag[i] - meanMag;
      sumSqErr += d * d;
    }
    const stdMag = Math.sqrt(sumSqErr / (gN || 1));

    // Adaptive thresholds
    const edgeThreshold = Math.max(8, meanMag + (1.1 - sensitivity) * stdMag);
    const textEdgeThreshold = Math.max(6, meanMag * 0.7 + (1.0 - sensitivity) * stdMag * 0.8);

    const candidateGrid = new Uint8Array(gN);

    // Feature cell classification
    for (let y = 1; y < gH - 1; y++) {
      const row = y * gW;
      for (let x = 1; x < gW - 1; x++) {
        const idx = row + x;
        const mag = gradMag[idx];
        const gx = gradX[idx];
        const gy = gradY[idx];
        const s = sat[idx];

        // Corner boost check (stamps/logos often in outer 22%)
        const isCorner = (x < gW * 0.22 || x > gW * 0.78) && (y < gH * 0.22 || y > gH * 0.78);
        const effectiveThresh = isCorner ? edgeThreshold * 0.75 : edgeThreshold;

        let isCandidate = false;

        // 1. High-contrast edge
        if (mag >= effectiveThresh) {
          isCandidate = true;
        }
        // 2. Text stroke heuristic (horizontal progression of vertical edges)
        else if (gx >= textEdgeThreshold && gx > gy * 0.8) {
          isCandidate = true;
        }
        // 3. Colored badge / logo (high saturation + moderate edge)
        else if (s > 70 && mag >= effectiveThresh * 0.5) {
          isCandidate = true;
        }
        // 4. Semi-transparent watermark in central area
        else if (mag >= 8 && mag < effectiveThresh && (x > gW * 0.2 && x < gW * 0.8 && y > gH * 0.25 && y < gH * 0.75)) {
          if (gx > 10 || gy > 10) isCandidate = true;
        }

        if (isCandidate) {
          candidateGrid[idx] = 1;
        }
      }
    }

    // Morphological dilation to connect characters & contiguous strokes
    const dilatedGrid = new Uint8Array(gN);
    const dilateX = Math.max(2, Math.round(4 * scale));
    const dilateY = Math.max(1, Math.round(2 * scale));

    for (let y = 1; y < gH - 1; y++) {
      for (let x = 1; x < gW - 1; x++) {
        if (candidateGrid[y * gW + x] === 1) {
          for (let dy = -dilateY; dy <= dilateY; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= gH) continue;
            for (let dx = -dilateX; dx <= dilateX; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= gW) continue;
              dilatedGrid[ny * gW + nx] = 1;
            }
          }
        }
      }
    }

    // Connected Component Analysis (BFS flood fill)
    const visited = new Uint8Array(gN);
    const rawRegions = [];

    for (let y = 0; y < gH; y++) {
      for (let x = 0; x < gW; x++) {
        const startIdx = y * gW + x;
        if (dilatedGrid[startIdx] === 0 || visited[startIdx] === 1) continue;

        let minX = x, maxX = x, minY = y, maxY = y;
        let cellCount = 0;
        let totalMag = 0;
        let totalSat = 0;
        let totalGx = 0;
        let totalGy = 0;

        const queue = [startIdx];
        visited[startIdx] = 1;
        let head = 0;

        while (head < queue.length) {
          const curr = queue[head++];
          const cy = Math.floor(curr / gW);
          const cx = curr % gW;
          cellCount++;

          totalMag += gradMag[curr];
          totalSat += sat[curr];
          totalGx += gradX[curr];
          totalGy += gradY[curr];

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // 4-connected neighbors
          const nbs = [
            cx > 0 ? curr - 1 : -1,
            cx < gW - 1 ? curr + 1 : -1,
            cy > 0 ? curr - gW : -1,
            cy < gH - 1 ? curr + gW : -1
          ];

          for (const nb of nbs) {
            if (nb !== -1 && dilatedGrid[nb] === 1 && visited[nb] === 0) {
              visited[nb] = 1;
              queue.push(nb);
            }
          }
        }

        // Convert scaled bounding box to original coordinates
        const boxW = maxX - minX + 1;
        const boxH = maxY - minY + 1;
        const origX = Math.max(0, Math.min(W - 1, Math.floor(minX / scale)));
        const origY = Math.max(0, Math.min(H - 1, Math.floor(minY / scale)));
        const origW = Math.max(1, Math.min(W - origX, Math.ceil(boxW / scale)));
        const origH = Math.max(1, Math.min(H - origY, Math.ceil(boxH / scale)));
        const area = origW * origH;

        // Filter noise: reject tiny fragments or whole-image captures
        if (area < minArea || area > W * H * 0.75) continue;
        if (origW < 10 || origH < 6) continue;

        const aspect = origW / Math.max(1, origH);
        const density = cellCount / (boxW * boxH);
        const avgSat = cellCount > 0 ? totalSat / cellCount : 0;
        const isCorner = (origX < W * 0.25 || origX + origW > W * 0.75) && (origY < H * 0.25 || origY + origH > H * 0.75);

        // Classification heuristics
        let detectedType = 'watermark';
        let confidence = 0.5;

        if (aspect >= 1.8 && totalGx > totalGy * 0.7) {
          // Elongated horizontal cluster with high vertical strokes -> Text
          detectedType = 'text';
          confidence = Math.min(0.96, 0.6 + Math.min(0.3, (aspect - 1.5) * 0.08) + (density > 0.3 ? 0.1 : 0));
        } else if (isCorner && (aspect >= 0.4 && aspect <= 2.5)) {
          // Corner localized badge or watermark stamp
          if (avgSat > 40 || density > 0.45) {
            detectedType = 'logo';
            confidence = Math.min(0.98, 0.7 + (density > 0.5 ? 0.2 : 0.1));
          } else {
            detectedType = 'watermark';
            confidence = Math.min(0.95, 0.65 + (isCorner ? 0.15 : 0));
          }
        } else if (aspect >= 0.5 && aspect <= 2.2 && (density > 0.4 || avgSat > 50)) {
          // Compact saturated emblem -> Logo
          detectedType = 'logo';
          confidence = Math.min(0.94, 0.6 + (avgSat > 50 ? 0.2 : 0.1));
        } else {
          // Broad or semi-transparent overlay -> Watermark
          detectedType = 'watermark';
          confidence = Math.min(0.92, 0.55 + (density > 0.35 ? 0.15 : 0.05));
        }

        const matchesType =
          requestedType === 'all' ||
          requestedType === detectedType ||
          (requestedType === 'watermark' && (detectedType === 'text' || detectedType === 'logo'));

        if (matchesType) {
          rawRegions.push({
            x: origX,
            y: origY,
            w: origW,
            h: origH,
            confidence: Number(confidence.toFixed(2)),
            type: detectedType
          });
        }
      }
    }

    // Non-Maximum Suppression and Overlap Merging
    rawRegions.sort((a, b) => b.confidence !== a.confidence ? b.confidence - a.confidence : (b.w * b.h) - (a.w * a.h));

    const merged = [];
    const mergedMask = new Uint8Array(rawRegions.length);

    for (let i = 0; i < rawRegions.length; i++) {
      if (mergedMask[i] === 1) continue;
      let r1 = { ...rawRegions[i] };

      for (let j = i + 1; j < rawRegions.length; j++) {
        if (mergedMask[j] === 1) continue;
        const r2 = rawRegions[j];

        const xA = Math.max(r1.x, r2.x);
        const yA = Math.max(r1.y, r2.y);
        const xB = Math.min(r1.x + r1.w, r2.x + r2.w);
        const yB = Math.min(r1.y + r1.h, r2.y + r2.h);
        const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);

        const area1 = r1.w * r1.h;
        const area2 = r2.w * r2.h;
        const unionArea = area1 + area2 - interArea;
        const iou = unionArea > 0 ? interArea / unionArea : 0;
        const overlap1 = area1 > 0 ? interArea / area1 : 0;
        const overlap2 = area2 > 0 ? interArea / area2 : 0;

        if (iou > 0.25 || overlap1 > 0.6 || overlap2 > 0.6) {
          const newX = Math.min(r1.x, r2.x);
          const newY = Math.min(r1.y, r2.y);
          const newW = Math.max(r1.x + r1.w, r2.x + r2.w) - newX;
          const newH = Math.max(r1.y + r1.h, r2.y + r2.h) - newY;

          r1.x = newX;
          r1.y = newY;
          r1.w = newW;
          r1.h = newH;
          r1.confidence = Math.max(r1.confidence, r2.confidence);
          mergedMask[j] = 1;
        }
      }

      merged.push(r1);
      if (merged.length >= maxRegions) break;
    }

    if (options.returnMask) {
      const binaryMask = createMaskFromRegions(merged, W, H, options.padding || 4);
      return { regions: merged, binaryMask };
    }

    return merged;
  }

  /**
   * Helper to rasterize an array of bounding box regions into a 1-channel binary mask.
   *
   * @param {Array<Object>} regions - Array of { x, y, w, h }
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @param {number} [padding=4] - Boundary dilation padding in pixels
   * @returns {Uint8Array} Binary mask (255 inside regions, 0 elsewhere)
   */
  function createMaskFromRegions(regions, width, height, padding = 4) {
    const mask = new Uint8Array(width * height);
    if (!Array.isArray(regions)) return mask;

    const pad = Math.max(0, Math.round(padding));
    for (const r of regions) {
      const x0 = Math.max(0, Math.floor(r.x - pad));
      const y0 = Math.max(0, Math.floor(r.y - pad));
      const x1 = Math.min(width, Math.ceil(r.x + r.w + pad));
      const y1 = Math.min(height, Math.ceil(r.y + r.h + pad));

      for (let y = y0; y < y1; y++) {
        const row = y * width;
        for (let x = x0; x < x1; x++) {
          mask[row + x] = 255;
        }
      }
    }
    return mask;
  }

  /**
   * Auto-detect text regions in image.
   * @param {ImageData} imageData
   * @param {Object} [options]
   */
  function autoDetectText(imageData, options = {}) {
    return autoDetectRegions(imageData, { ...options, type: 'text' });
  }

  /**
   * Auto-detect logo / badge regions in image.
   * @param {ImageData} imageData
   * @param {Object} [options]
   */
  function autoDetectLogos(imageData, options = {}) {
    return autoDetectRegions(imageData, { ...options, type: 'logo' });
  }

  /**
   * Auto-detect watermark & corner stamp regions in image.
   * @param {ImageData} imageData
   * @param {Object} [options]
   */
  function autoDetectWatermarks(imageData, options = {}) {
    return autoDetectRegions(imageData, { ...options, type: 'watermark' });
  }

  // =========================================================================
  // Public API Export
  // =========================================================================
  return {
    version: '1.0.0',
    createImageData,
    cloneImageData,
    inpaintTelea,
    inpaintNavierStokes,
    inpaintExemplar,
    delogoBilinear,
    temporalSmooth,
    createSelectionController,
    processVideo,
    processVideoFrames: processVideo, // Alias per PROJECT.md interface contract
    generateSampleImage,
    generateSampleVideo,
    autoDetectRegions,
    autoDetectText,
    autoDetectLogos,
    autoDetectWatermarks,
    createMaskFromRegions
  };
});
