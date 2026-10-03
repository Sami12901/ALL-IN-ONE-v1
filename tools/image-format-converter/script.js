// Image Format Converter - Complete Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const targetFormatSelect = document.getElementById('target-format-select');
  const icoSizeGroup = document.getElementById('ico-size-group');
  const icoSizeSelect = document.getElementById('ico-size-select');
  const qualitySliderGroup = document.getElementById('quality-slider-group');
  const qualityRange = document.getElementById('quality-range');
  const qualityVal = document.getElementById('quality-val');
  const bgColorGroup = document.getElementById('bg-color-group');
  const bgColorInput = document.getElementById('bg-color-input');
  const bgColorHex = document.getElementById('bg-color-hex');
  const quickColorBtns = document.querySelectorAll('.quick-color-btn');

  // Upload elements
  const dropzone = document.getElementById('converter-dropzone');
  const fileInput = document.getElementById('converter-file-input');
  const browseBtn = document.getElementById('browse-btn');

  // Queue elements
  const queueTotalCount = document.getElementById('queue-total-count');
  const queueDoneCount = document.getElementById('queue-done-count');
  const convertAllBtn = document.getElementById('convert-all-btn');
  const downloadZipBtn = document.getElementById('download-zip-btn');
  const clearQueueBtn = document.getElementById('clear-queue-btn');
  const queueEmptyState = document.getElementById('queue-empty-state');
  const queueTableWrapper = document.getElementById('queue-table-wrapper');
  const queueTbody = document.getElementById('queue-tbody');

  // Toast
  const appToast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  // Queue State
  let queue = [];
  let nextId = 1;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Update Controls Visibility based on selected format
  function updateControlsVisibility() {
    const fmt = targetFormatSelect.value;
    if (fmt === 'ico') {
      icoSizeGroup.style.display = 'flex';
      qualitySliderGroup.style.display = 'none';
      bgColorGroup.style.display = 'flex';
    } else if (fmt === 'jpeg' || fmt === 'webp') {
      icoSizeGroup.style.display = 'none';
      qualitySliderGroup.style.display = 'flex';
      bgColorGroup.style.display = (fmt === 'jpeg') ? 'flex' : 'none';
    } else if (fmt === 'bmp') {
      icoSizeGroup.style.display = 'none';
      qualitySliderGroup.style.display = 'none';
      bgColorGroup.style.display = 'flex';
    } else {
      // png, gif
      icoSizeGroup.style.display = 'none';
      qualitySliderGroup.style.display = 'none';
      bgColorGroup.style.display = 'none';
    }
  }

  targetFormatSelect.addEventListener('change', updateControlsVisibility);
  updateControlsVisibility();

  // Quality range input
  qualityRange.addEventListener('input', () => {
    qualityVal.textContent = `${qualityRange.value}%`;
  });

  // Background color sync
  bgColorInput.addEventListener('input', () => {
    bgColorHex.value = bgColorInput.value.toUpperCase();
  });

  bgColorHex.addEventListener('input', () => {
    const val = bgColorHex.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      bgColorInput.value = val;
    }
  });

  quickColorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const col = btn.dataset.color;
      bgColorInput.value = col;
      bgColorHex.value = col.toUpperCase();
    });
  });

  // BMP Binary Encoder (24-bit uncompressed BMP)
  function encodeBmp(canvas) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const rowSize = Math.floor((24 * width + 31) / 32) * 4;
    const pixelArraySize = rowSize * height;
    const fileSize = 54 + pixelArraySize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // BITMAPFILEHEADER (14 bytes)
    bytes[0] = 0x42; // 'B'
    bytes[1] = 0x4D; // 'M'
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, 54, true);

    // BITMAPINFOHEADER (40 bytes)
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    // Pixel array (bottom-up, BGR)
    let offset = 54;
    for (let y = height - 1; y >= 0; y--) {
      let rowOffset = offset;
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        bytes[rowOffset++] = data[srcIdx + 2]; // B
        bytes[rowOffset++] = data[srcIdx + 1]; // G
        bytes[rowOffset++] = data[srcIdx];     // R
      }
      offset += rowSize;
    }

    return new Blob([buffer], { type: 'image/bmp' });
  }

  // ICO Binary Encoder (PNG-container ICO format)
  async function encodeIco(img, sizeMode) {
    const sizes = sizeMode === 'multi' ? [16, 32, 48] : [parseInt(sizeMode, 10)];
    const pngBuffers = [];
    const validSizes = [];

    for (const s of sizes) {
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, s, s);

      const blob = await new Promise(resolve => c.toBlob(resolve, 'image/png'));
      if (blob) {
        const buf = new Uint8Array(await blob.arrayBuffer());
        pngBuffers.push(buf);
        validSizes.push(s);
      }
    }

    if (pngBuffers.length === 0) throw new Error('Failed to generate ICO frames.');

    const count = pngBuffers.length;
    const headerSize = 6 + count * 16;
    let totalSize = headerSize;
    for (const b of pngBuffers) totalSize += b.length;

    const icoBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(icoBuffer);
    const bytes = new Uint8Array(icoBuffer);

    // ICONDIR
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true); // type 1 = icon
    view.setUint16(4, count, true);

    let currentOffset = headerSize;
    for (let i = 0; i < count; i++) {
      const size = validSizes[i];
      const buf = pngBuffers[i];
      const entryOffset = 6 + i * 16;

      bytes[entryOffset + 0] = size >= 256 ? 0 : size;
      bytes[entryOffset + 1] = size >= 256 ? 0 : size;
      bytes[entryOffset + 2] = 0;
      bytes[entryOffset + 3] = 0;
      view.setUint16(entryOffset + 4, 1, true); // planes
      view.setUint16(entryOffset + 6, 32, true); // bpp
      view.setUint32(entryOffset + 8, buf.length, true); // size
      view.setUint32(entryOffset + 12, currentOffset, true); // offset

      bytes.set(buf, currentOffset);
      currentOffset += buf.length;
    }

    return new Blob([icoBuffer], { type: 'image/x-icon' });
  }

  // Update Summary Toolbar Buttons
  function updateSummary() {
    const total = queue.length;
    const done = queue.filter(item => item.status === 'done').length;

    queueTotalCount.textContent = `${total} ${total === 1 ? 'item' : 'items'}`;
    queueDoneCount.textContent = `${done} converted`;

    const hasQueued = queue.some(item => item.status === 'queued' || item.status === 'error');
    convertAllBtn.disabled = !hasQueued;
    downloadZipBtn.disabled = done === 0;
    clearQueueBtn.disabled = total === 0;

    if (total === 0) {
      queueEmptyState.style.display = 'block';
      queueTableWrapper.style.display = 'none';
    } else {
      queueEmptyState.style.display = 'none';
      queueTableWrapper.style.display = 'block';
    }
  }

  // Add Files to Queue
  function addFilesToQueue(files) {
    if (!files || files.length === 0) return;

    let addedCount = 0;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/') && !file.name.match(/\.(png|jpe?g|webp|gif|bmp|svg|ico)$/i)) {
        return;
      }

      const item = {
        id: nextId++,
        file: file,
        name: file.name,
        originalSize: file.size,
        originalType: file.type || 'image/' + file.name.split('.').pop().toLowerCase(),
        thumbUrl: URL.createObjectURL(file),
        status: 'queued', // queued | converting | done | error
        convertedBlob: null,
        convertedSize: 0,
        convertedName: '',
        errorMsg: ''
      };

      queue.push(item);
      addedCount++;
      renderRow(item);
    });

    if (addedCount > 0) {
      updateSummary();
      showToast(`Added ${addedCount} ${addedCount === 1 ? 'image' : 'images'} to queue.`);
    } else {
      showToast('No valid image files found.');
    }
  }

  // Render a Single Queue Row
  function renderRow(item) {
    const tr = document.createElement('tr');
    tr.id = `row-${item.id}`;

    const originalFormatDisplay = (item.file.type || item.name.split('.').pop()).replace('image/', '').toUpperCase();

    tr.innerHTML = `
      <td>
        <img src="${item.thumbUrl}" class="queue-thumb" alt="Thumbnail">
      </td>
      <td>
        <div class="file-name-cell" title="${item.name}">${item.name}</div>
      </td>
      <td>
        <div style="font-weight: 500;">${originalFormatDisplay}</div>
        <div style="color: var(--text-tertiary); font-size: 0.75rem;">${formatBytes(item.originalSize)}</div>
      </td>
      <td id="target-cell-${item.id}">
        <span class="badge" style="background: var(--bg-secondary); border-color: var(--border); font-size: 0.75rem;">
          ${targetFormatSelect.value.toUpperCase()}
        </span>
      </td>
      <td id="size-cell-${item.id}">
        <span style="color: var(--text-tertiary);">&mdash;</span>
      </td>
      <td id="status-cell-${item.id}">
        <span class="status-badge status-queued">Queued</span>
      </td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 0.35rem;">
          <button class="btn btn-secondary convert-single-btn" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" type="button" title="Convert this image">
            Convert
          </button>
          <button class="btn btn-primary download-single-btn" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; display: none;" type="button" title="Download converted image">
            Download
          </button>
          <button class="btn btn-secondary remove-single-btn" data-id="${item.id}" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;" type="button" title="Remove from queue">
            &times;
          </button>
        </div>
      </td>
    `;

    // Attach row events
    tr.querySelector('.convert-single-btn').addEventListener('click', () => convertItem(item));
    tr.querySelector('.download-single-btn').addEventListener('click', () => downloadItem(item));
    tr.querySelector('.remove-single-btn').addEventListener('click', () => removeItem(item.id));

    queueTbody.appendChild(tr);
  }

  // Update Existing Row Display
  function updateRowUI(item) {
    const tr = document.getElementById(`row-${item.id}`);
    if (!tr) return;

    const targetCell = document.getElementById(`target-cell-${item.id}`);
    const sizeCell = document.getElementById(`size-cell-${item.id}`);
    const statusCell = document.getElementById(`status-cell-${item.id}`);
    const convertBtn = tr.querySelector('.convert-single-btn');
    const downloadBtn = tr.querySelector('.download-single-btn');

    targetCell.innerHTML = `
      <span class="badge" style="background: var(--bg-secondary); border-color: var(--border); font-size: 0.75rem;">
        ${targetFormatSelect.value.toUpperCase()}
      </span>
    `;

    if (item.status === 'converting') {
      statusCell.innerHTML = `<span class="status-badge status-converting">Converting...</span>`;
      convertBtn.disabled = true;
    } else if (item.status === 'done') {
      statusCell.innerHTML = `<span class="status-badge status-ready">Ready</span>`;
      convertBtn.style.display = 'none';
      downloadBtn.style.display = 'inline-flex';

      // Converted size & diff calculation
      const diff = item.convertedSize - item.originalSize;
      const pct = item.originalSize > 0 ? Math.round((Math.abs(diff) / item.originalSize) * 100) : 0;
      let badgeHtml = '';
      if (diff < 0) {
        badgeHtml = `<span class="savings-badge">-${pct}%</span>`;
      } else if (diff > 0) {
        badgeHtml = `<span class="increase-badge">+${pct}%</span>`;
      }

      sizeCell.innerHTML = `
        <span style="font-family: monospace; font-weight: 600;">${formatBytes(item.convertedSize)}</span>
        ${badgeHtml}
      `;
    } else if (item.status === 'error') {
      statusCell.innerHTML = `<span class="status-badge status-error" title="${item.errorMsg}">Error</span>`;
      sizeCell.innerHTML = `<span style="color: var(--error); font-size: 0.8rem;">Failed</span>`;
      convertBtn.disabled = false;
    } else {
      statusCell.innerHTML = `<span class="status-badge status-queued">Queued</span>`;
      sizeCell.innerHTML = `<span style="color: var(--text-tertiary);">&mdash;</span>`;
      convertBtn.style.display = 'inline-flex';
      downloadBtn.style.display = 'none';
      convertBtn.disabled = false;
    }
  }

  // Convert Single Item
  async function convertItem(item) {
    item.status = 'converting';
    updateRowUI(item);
    updateSummary();

    const targetFormat = targetFormatSelect.value;
    const quality = parseFloat(qualityRange.value) / 100;
    const bgColor = bgColorInput.value || '#ffffff';
    const icoSize = icoSizeSelect.value;

    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image source.'));
        img.src = item.thumbUrl;
      });

      const width = img.naturalWidth || 300;
      const height = img.naturalHeight || 300;

      let blob = null;
      let ext = targetFormat;

      if (targetFormat === 'ico') {
        blob = await encodeIco(img, icoSize);
        ext = 'ico';
      } else if (targetFormat === 'bmp') {
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        const ctx = c.getContext('2d');
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        blob = encodeBmp(c);
        ext = 'bmp';
      } else {
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        const ctx = c.getContext('2d');

        // Fill background color if JPEG
        if (targetFormat === 'jpeg') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, width, height);
          ext = 'jpg';
        } else if (targetFormat === 'png') {
          ext = 'png';
        } else if (targetFormat === 'webp') {
          ext = 'webp';
        } else if (targetFormat === 'gif') {
          ext = 'gif';
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeMap = {
          png: 'image/png',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
          gif: 'image/gif'
        };
        const mime = mimeMap[targetFormat] || 'image/png';

        blob = await new Promise(resolve => c.toBlob(resolve, mime, quality));
      }

      if (!blob) throw new Error('Canvas conversion returned empty data.');

      const baseName = item.name.replace(/\.[^/.]+$/, '');
      item.convertedBlob = blob;
      item.convertedSize = blob.size;
      item.convertedName = `${baseName}.${ext}`;
      item.status = 'done';
    } catch (err) {
      console.error(err);
      item.status = 'error';
      item.errorMsg = err.message || 'Conversion failed.';
    }

    updateRowUI(item);
    updateSummary();
  }

  // Convert All Queued Items
  async function convertAll() {
    const toConvert = queue.filter(item => item.status === 'queued' || item.status === 'error');
    if (toConvert.length === 0) return;

    convertAllBtn.disabled = true;
    for (const item of toConvert) {
      await convertItem(item);
    }
    showToast('Batch conversion complete!');
    updateSummary();
  }

  // Download Individual Item
  function downloadItem(item) {
    if (!item.convertedBlob) return;
    const url = URL.createObjectURL(item.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.convertedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${item.convertedName}`);
  }

  // Download All as ZIP
  async function downloadAllZip() {
    const doneItems = queue.filter(item => item.status === 'done' && item.convertedBlob);
    if (doneItems.length === 0) return;

    if (!window.JSZip) {
      showToast('ZIP library is loading. Please try again.');
      return;
    }

    try {
      downloadZipBtn.disabled = true;
      downloadZipBtn.textContent = 'Archiving ZIP...';

      const zip = new window.JSZip();
      const usedNames = new Set();

      doneItems.forEach(item => {
        let name = item.convertedName;
        if (usedNames.has(name)) {
          const dot = name.lastIndexOf('.');
          const base = dot > 0 ? name.slice(0, dot) : name;
          const ext = dot > 0 ? name.slice(dot) : '';
          let count = 1;
          while (usedNames.has(`${base}_${count}${ext}`)) {
            count++;
          }
          name = `${base}_${count}${ext}`;
        }
        usedNames.add(name);
        zip.file(name, item.convertedBlob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted-images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('ZIP archive downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate ZIP archive.');
    } finally {
      downloadZipBtn.disabled = false;
      downloadZipBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download All as ZIP
      `;
    }
  }

  // Remove Item from Queue
  function removeItem(id) {
    const idx = queue.findIndex(item => item.id === id);
    if (idx !== -1) {
      const item = queue[idx];
      URL.revokeObjectURL(item.thumbUrl);
      queue.splice(idx, 1);
      const tr = document.getElementById(`row-${id}`);
      if (tr) tr.remove();
      updateSummary();
    }
  }

  // Clear Entire Queue
  function clearQueue() {
    queue.forEach(item => {
      URL.revokeObjectURL(item.thumbUrl);
    });
    queue = [];
    queueTbody.innerHTML = '';
    updateSummary();
    showToast('Batch queue cleared.');
  }

  // Event Listeners
  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    addFilesToQueue(e.target.files);
    fileInput.value = '';
  });

  convertAllBtn.addEventListener('click', convertAll);
  downloadZipBtn.addEventListener('click', downloadAllZip);
  clearQueueBtn.addEventListener('click', clearQueue);

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files) {
      addFilesToQueue(e.dataTransfer.files);
    }
  });

  // Global window drag and drop
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    if (e.target !== dropzone && !dropzone.contains(e.target)) {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFilesToQueue(e.dataTransfer.files);
      }
    }
  });
});