// Image to Base64 Converter - Complete Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const previewCard = document.getElementById('preview-card');
  const previewFilename = document.getElementById('preview-filename');
  const previewImage = document.getElementById('preview-image');
  const clearImageBtn = document.getElementById('clear-image-btn');

  // Metadata elements
  const metaMime = document.getElementById('meta-mime');
  const metaDims = document.getElementById('meta-dims');
  const metaOrigSize = document.getElementById('meta-orig-size');
  const metaB64Len = document.getElementById('meta-b64-len');
  const metaOverhead = document.getElementById('meta-overhead');

  // Output elements
  const outputEmptyState = document.getElementById('output-empty-state');
  const outputActiveState = document.getElementById('output-active-state');
  const outputTextarea = document.getElementById('output-textarea');
  const outputFormatDesc = document.getElementById('output-format-desc');
  const outputCharCount = document.getElementById('output-char-count');
  const copyBtn = document.getElementById('copy-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const downloadTxtBtn = document.getElementById('download-txt-btn');
  const formatTabBtns = document.querySelectorAll('.format-tab-btn');

  // Toast
  const appToast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  // Active state
  let currentFile = null;
  let currentDataUrl = '';
  let currentRawBase64 = '';
  let currentFormat = 'datauri'; // 'datauri' | 'raw' | 'html' | 'css'

  const formatDescriptions = {
    datauri: 'Full Data URI ready for src, href, and direct browser rendering.',
    raw: 'Pure Base64 string payload without metadata prefix.',
    html: 'Standard inline HTML <img> element snippet.',
    css: 'CSS background-image rule snippet.'
  };

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

  function formatNumber(num) {
    return num.toLocaleString();
  }

  function getFormatSnippet(format) {
    if (!currentDataUrl) return '';
    const safeName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '').replace(/["']/g, '') : 'image';
    switch (format) {
      case 'datauri':
        return currentDataUrl;
      case 'raw':
        return currentRawBase64;
      case 'html':
        return `<img src="${currentDataUrl}" alt="${safeName}" />`;
      case 'css':
        return `background-image: url('${currentDataUrl}');`;
      default:
        return currentDataUrl;
    }
  }

  function updateOutput() {
    if (!currentDataUrl) return;
    const snippet = getFormatSnippet(currentFormat);
    outputTextarea.value = snippet;
    outputCharCount.textContent = `${formatNumber(snippet.length)} characters`;
    outputFormatDesc.textContent = formatDescriptions[currentFormat] || '';
  }

  function switchTab(format) {
    currentFormat = format;
    formatTabBtns.forEach(btn => {
      if (btn.dataset.format === format) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    updateOutput();
  }

  function processImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      currentDataUrl = e.target.result;
      const commaIdx = currentDataUrl.indexOf(',');
      currentRawBase64 = commaIdx >= 0 ? currentDataUrl.slice(commaIdx + 1) : currentDataUrl;

      // Load into Image to get natural dimensions
      const img = new Image();
      img.onload = () => {
        // UI Updates
        previewFilename.textContent = file.name;
        previewImage.src = currentDataUrl;
        
        metaMime.textContent = file.type || 'image/png';
        metaDims.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
        metaOrigSize.textContent = formatBytes(file.size);
        metaB64Len.textContent = `${formatNumber(currentRawBase64.length)} chars`;

        // Calculate overhead
        const rawBytes = file.size;
        const b64Bytes = currentRawBase64.length;
        const overheadPercent = rawBytes > 0 ? (((b64Bytes - rawBytes) / rawBytes) * 100).toFixed(1) : '33.3';
        metaOverhead.textContent = `+${overheadPercent}% Overhead (Binary → Text)`;

        dropzone.style.display = 'none';
        previewCard.style.display = 'flex';

        outputEmptyState.style.display = 'none';
        outputActiveState.style.display = 'flex';

        updateOutput();
        showToast('Image converted to Base64 successfully!');
      };

      img.onerror = () => {
        showToast('Failed to load image preview.');
      };

      img.src = currentDataUrl;
    };

    reader.onerror = () => {
      showToast('Error reading image file.');
    };

    reader.readAsDataURL(file);
  }

  function clearState() {
    currentFile = null;
    currentDataUrl = '';
    currentRawBase64 = '';
    fileInput.value = '';

    previewImage.src = '';
    previewCard.style.display = 'none';
    dropzone.style.display = 'flex';

    outputTextarea.value = '';
    outputActiveState.style.display = 'none';
    outputEmptyState.style.display = 'flex';
  }

  // Event Listeners
  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  });

  clearImageBtn.addEventListener('click', clearState);

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  });

  // Global Drag and Drop onto document window
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    if (e.target !== dropzone && !dropzone.contains(e.target)) {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        processImageFile(e.dataTransfer.files[0]);
      }
    }
  });

  // Clipboard Paste support
  window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            processImageFile(file);
            showToast('Pasted image from clipboard!');
            return;
          }
        }
      }
    }
  });

  // Tab buttons
  formatTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.format);
    });
  });

  // Copy Action
  copyBtn.addEventListener('click', async () => {
    const text = outputTextarea.value;
    if (!text) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        outputTextarea.select();
        document.execCommand('copy');
      }

      const origText = copyBtnText.textContent;
      copyBtnText.textContent = 'Copied to Clipboard!';
      copyBtn.classList.add('copied');
      showToast(`Copied ${formatTabBtns[0].textContent.trim()} snippet!`);

      setTimeout(() => {
        copyBtnText.textContent = origText;
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error(err);
      showToast('Could not copy to clipboard.');
    }
  });

  // Download Base64 as .txt
  downloadTxtBtn.addEventListener('click', () => {
    const text = outputTextarea.value;
    if (!text) return;

    const baseName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'encoded-image';
    const filename = `${baseName}-${currentFormat}.txt`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${filename}`);
  });
});