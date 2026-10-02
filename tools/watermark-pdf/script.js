// Watermark PDF Logic - 100% Client-side
/* global PDFLib */

class PdfWatermarker {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');

    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.uiMeta = document.getElementById('ui-meta');
    this.btnChangeFile = document.getElementById('btn-change-file');

    // Modes
    this.tabTextMode = document.getElementById('tab-text-mode');
    this.tabImageMode = document.getElementById('tab-image-mode');
    this.textControls = document.getElementById('text-controls');
    this.imageControls = document.getElementById('image-controls');
    this.currentMode = 'text'; // 'text' or 'image'

    // Text Mode Controls
    this.wmText = document.getElementById('wm-text');
    this.wmColor = document.getElementById('wm-color');
    this.wmColorHex = document.getElementById('wm-color-hex');
    this.wmFontSize = document.getElementById('wm-font-size');
    this.valFontSize = document.getElementById('val-font-size');
    this.wmOpacity = document.getElementById('wm-opacity');
    this.valOpacity = document.getElementById('val-opacity');
    this.wmRotation = document.getElementById('wm-rotation');
    this.valRotation = document.getElementById('val-rotation');
    this.textPresetButtons = document.querySelectorAll('[data-pos]');
    this.currentTextPreset = 'diagonal-center';

    // Image Mode Controls
    this.btnBrowseLogo = document.getElementById('btn-browse-logo');
    this.logoInput = document.getElementById('logo-input');
    this.uiLogoName = document.getElementById('ui-logo-name');
    this.wmImgScale = document.getElementById('wm-img-scale');
    this.valImgScale = document.getElementById('val-img-scale');
    this.wmImgOpacity = document.getElementById('wm-img-opacity');
    this.valImgOpacity = document.getElementById('val-img-opacity');
    this.wmImgRotation = document.getElementById('wm-img-rotation');
    this.valImgRotation = document.getElementById('val-img-rotation');
    this.imgPresetButtons = document.querySelectorAll('[data-img-pos]');
    this.currentImgPreset = 'diagonal-center';
    this.imageBuffer = null;
    this.imageType = null; // 'png' or 'jpg'
    this.imageDataUrl = null;

    // Page Target Selection
    this.pageTargetRadios = document.querySelectorAll('input[name="page-target"]');
    this.customRangeInput = document.getElementById('custom-range-input');

    // Process & Preview
    this.btnProcess = document.getElementById('btn-process-wm');
    this.btnProcessText = document.getElementById('btn-process-text');
    this.previewStage = document.getElementById('preview-stage');
    this.previewText = document.getElementById('wm-preview-text');
    this.previewImg = document.getElementById('wm-preview-img');

    this.currentFile = null;
    this.fileBuffer = null;
    this.pageCount = 0;

    this.bindEvents();
    this.updatePreview();
  }

  bindEvents() {
    // Upload Zone
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handlePdf(e.target.files[0]);
      }
    });

    this.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadZone.classList.add('dragover');
    });
    this.uploadZone.addEventListener('dragleave', () => {
      this.uploadZone.classList.remove('dragover');
    });
    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handlePdf(e.dataTransfer.files[0]);
      }
    });

    this.btnChangeFile.addEventListener('click', () => this.reset());

    // Mode Switching
    this.tabTextMode.addEventListener('click', () => this.switchMode('text'));
    this.tabImageMode.addEventListener('click', () => this.switchMode('image'));

    // Text Controls Listeners
    this.wmText.addEventListener('input', () => this.updatePreview());
    this.wmColor.addEventListener('input', (e) => {
      this.wmColorHex.textContent = e.target.value.toLowerCase();
      this.updatePreview();
    });
    this.wmFontSize.addEventListener('input', (e) => {
      this.valFontSize.textContent = e.target.value;
      this.updatePreview();
    });
    this.wmOpacity.addEventListener('input', (e) => {
      this.valOpacity.textContent = parseFloat(e.target.value).toFixed(2);
      this.updatePreview();
    });
    this.wmRotation.addEventListener('input', (e) => {
      this.valRotation.textContent = e.target.value;
      this.updatePreview();
    });

    this.textPresetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.textPresetButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyTextPreset(btn.dataset.pos);
      });
    });

    // Image Controls Listeners
    this.btnBrowseLogo.addEventListener('click', () => this.logoInput.click());
    this.logoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleLogo(e.target.files[0]);
      }
    });

    this.wmImgScale.addEventListener('input', (e) => {
      this.valImgScale.textContent = e.target.value;
      this.updatePreview();
    });
    this.wmImgOpacity.addEventListener('input', (e) => {
      this.valImgOpacity.textContent = parseFloat(e.target.value).toFixed(2);
      this.updatePreview();
    });
    this.wmImgRotation.addEventListener('input', (e) => {
      this.valImgRotation.textContent = e.target.value;
      this.updatePreview();
    });

    this.imgPresetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.imgPresetButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyImgPreset(btn.dataset.imgPos);
      });
    });

    // Page Selection
    this.pageTargetRadios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          this.customRangeInput.style.display = 'block';
          this.customRangeInput.focus();
        } else {
          this.customRangeInput.style.display = 'none';
        }
      });
    });

    // Execute Watermarking
    this.btnProcess.addEventListener('click', () => this.executeWatermark());
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === 'text') {
      this.tabTextMode.classList.add('active');
      this.tabImageMode.classList.remove('active');
      this.textControls.style.display = 'flex';
      this.imageControls.style.display = 'none';
    } else {
      this.tabImageMode.classList.add('active');
      this.tabTextMode.classList.remove('active');
      this.textControls.style.display = 'none';
      this.imageControls.style.display = 'flex';
    }
    this.updatePreview();
  }

  applyTextPreset(preset) {
    this.currentTextPreset = preset;
    switch (preset) {
      case 'diagonal-center':
        this.wmRotation.value = 45;
        this.valRotation.textContent = '45';
        break;
      case 'center':
        this.wmRotation.value = 0;
        this.valRotation.textContent = '0';
        break;
      case 'top-left':
        this.wmRotation.value = 0;
        this.valRotation.textContent = '0';
        break;
      case 'bottom-right':
        this.wmRotation.value = 0;
        this.valRotation.textContent = '0';
        break;
      case 'stamp':
        this.wmRotation.value = -15;
        this.valRotation.textContent = '-15';
        break;
    }
    this.updatePreview();
  }

  applyImgPreset(preset) {
    this.currentImgPreset = preset;
    switch (preset) {
      case 'diagonal-center':
        this.wmImgRotation.value = 45;
        this.valImgRotation.textContent = '45';
        break;
      case 'center':
        this.wmImgRotation.value = 0;
        this.valImgRotation.textContent = '0';
        break;
      case 'top-left':
        this.wmImgRotation.value = 0;
        this.valImgRotation.textContent = '0';
        break;
      case 'bottom-right':
        this.wmImgRotation.value = 0;
        this.valImgRotation.textContent = '0';
        break;
      case 'stamp':
        this.wmImgRotation.value = -15;
        this.valImgRotation.textContent = '-15';
        break;
    }
    this.updatePreview();
  }

  async handleLogo(file) {
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      alert('Please select a PNG or JPG image file.');
      return;
    }

    this.uiLogoName.textContent = file.name;
    this.imageType = file.type === 'image/png' ? 'png' : 'jpg';
    this.imageBuffer = await file.arrayBuffer();

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageDataUrl = e.target.result;
      this.previewImg.src = this.imageDataUrl;
      this.updatePreview();
    };
    reader.readAsDataURL(file);
  }

  updatePreview() {
    if (this.currentMode === 'text') {
      this.previewText.style.display = 'block';
      this.previewImg.style.display = 'none';

      const text = this.wmText.value || 'WATERMARK';
      const color = this.wmColor.value;
      const opacity = parseFloat(this.wmOpacity.value);
      const fontSize = parseInt(this.wmFontSize.value, 10);
      const rotation = parseInt(this.wmRotation.value, 10);

      // Scaled preview font size (roughly 50% of PDF point size for the 320px preview canvas)
      const previewFontSize = Math.max(10, Math.round(fontSize * 0.5));

      this.previewText.textContent = text;
      this.previewText.style.color = color;
      this.previewText.style.opacity = opacity.toString();
      this.previewText.style.fontSize = `${previewFontSize}px`;

      // Positioning based on preset
      this.resetPreviewPosition(this.previewText);

      switch (this.currentTextPreset) {
        case 'diagonal-center':
        case 'center':
          this.previewText.style.left = '50%';
          this.previewText.style.top = '50%';
          this.previewText.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
          break;
        case 'top-left':
          this.previewText.style.left = '20px';
          this.previewText.style.top = '25px';
          this.previewText.style.transform = `rotate(${rotation}deg)`;
          break;
        case 'bottom-right':
          this.previewText.style.right = '20px';
          this.previewText.style.bottom = '25px';
          this.previewText.style.transform = `rotate(${rotation}deg)`;
          break;
        case 'stamp':
          this.previewText.style.right = '24px';
          this.previewText.style.bottom = '35px';
          this.previewText.style.border = `2px dashed ${color}`;
          this.previewText.style.padding = '4px 8px';
          this.previewText.style.borderRadius = '4px';
          this.previewText.style.transform = `rotate(${rotation}deg)`;
          break;
      }
    } else {
      this.previewText.style.display = 'none';
      if (!this.imageDataUrl) {
        this.previewImg.style.display = 'none';
        return;
      }

      this.previewImg.style.display = 'block';
      const opacity = parseFloat(this.wmImgOpacity.value);
      const scalePercent = parseInt(this.wmImgScale.value, 10);
      const rotation = parseInt(this.wmImgRotation.value, 10);

      this.previewImg.style.opacity = opacity.toString();
      this.previewImg.style.maxWidth = `${scalePercent}%`;
      this.previewImg.style.maxHeight = `${scalePercent}%`;

      this.resetPreviewPosition(this.previewImg);

      switch (this.currentImgPreset) {
        case 'diagonal-center':
        case 'center':
          this.previewImg.style.left = '50%';
          this.previewImg.style.top = '50%';
          this.previewImg.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
          break;
        case 'top-left':
          this.previewImg.style.left = '20px';
          this.previewImg.style.top = '25px';
          this.previewImg.style.transform = `rotate(${rotation}deg)`;
          break;
        case 'bottom-right':
          this.previewImg.style.right = '20px';
          this.previewImg.style.bottom = '25px';
          this.previewImg.style.transform = `rotate(${rotation}deg)`;
          break;
        case 'stamp':
          this.previewImg.style.right = '24px';
          this.previewImg.style.bottom = '35px';
          this.previewImg.style.transform = `rotate(${rotation}deg)`;
          break;
      }
    }
  }

  resetPreviewPosition(el) {
    el.style.left = 'auto';
    el.style.top = 'auto';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.border = 'none';
    el.style.padding = '0';
  }

  hexToRgb(hex) {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return { r, g, b };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async handlePdf(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    this.currentFile = file;
    this.uiFilename.textContent = file.name;
    this.uiMeta.textContent = 'Loading...';

    this.uploadZone.style.display = 'none';
    this.workspace.style.display = 'flex';

    try {
      this.fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(this.fileBuffer, { ignoreEncryption: true });
      this.pageCount = pdfDoc.getPageCount();
      this.uiMeta.textContent = `${this.pageCount} Page${this.pageCount !== 1 ? 's' : ''} • ${this.formatBytes(file.size)}`;
      this.updatePreview();
    } catch (e) {
      console.error(e);
      alert('Error loading PDF: ' + e.message);
      this.reset();
    }
  }

  parseCustomRange(rangeStr, maxPages) {
    const selected = new Set();
    const parts = rangeStr.split(',');
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((s) => parseInt(s.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= maxPages) selected.add(i - 1);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= maxPages) {
          selected.add(p - 1);
        }
      }
    }
    return selected;
  }

  isPageSelected(pageIndex, maxPages, selectionMode) {
    switch (selectionMode) {
      case 'all':
        return true;
      case 'first':
        return pageIndex === 0;
      case 'odd':
        return (pageIndex + 1) % 2 === 1;
      case 'even':
        return (pageIndex + 1) % 2 === 0;
      case 'custom': {
        const customSet = this.parseCustomRange(this.customRangeInput.value, maxPages);
        return customSet.has(pageIndex);
      }
      default:
        return true;
    }
  }

  async executeWatermark() {
    if (!this.fileBuffer) return;

    if (this.currentMode === 'image' && !this.imageBuffer) {
      alert('Please upload an image/logo for the watermark.');
      return;
    }

    const targetMode = document.querySelector('input[name="page-target"]:checked').value;
    if (targetMode === 'custom' && !this.customRangeInput.value.trim()) {
      alert('Please enter a valid page range (e.g. 1-3, 5).');
      this.customRangeInput.focus();
      return;
    }

    this.btnProcess.disabled = true;
    this.btnProcessText.textContent = 'Applying Watermark...';

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(this.fileBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      if (this.currentMode === 'text') {
        const text = this.wmText.value.trim() || 'WATERMARK';
        const fontSize = parseInt(this.wmFontSize.value, 10);
        const opacity = parseFloat(this.wmOpacity.value);
        const rotationDeg = parseInt(this.wmRotation.value, 10);
        const { r, g, b } = this.hexToRgb(this.wmColor.value);
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        const rad = (rotationDeg * Math.PI) / 180;

        for (let i = 0; i < totalPages; i++) {
          if (!this.isPageSelected(i, totalPages, targetMode)) continue;

          const page = pages[i];
          const { width: pW, height: pH } = page.getSize();

          let drawX = 0;
          let drawY = 0;

          switch (this.currentTextPreset) {
            case 'diagonal-center':
            case 'center': {
              const offsetX = (textWidth / 2) * Math.cos(rad) - (textHeight / 2) * Math.sin(rad);
              const offsetY = (textWidth / 2) * Math.sin(rad) + (textHeight / 2) * Math.cos(rad);
              drawX = pW / 2 - offsetX;
              drawY = pH / 2 - offsetY;
              break;
            }
            case 'top-left': {
              drawX = 36;
              drawY = pH - 36 - textHeight;
              break;
            }
            case 'bottom-right': {
              drawX = pW - 36 - textWidth;
              drawY = 36;
              break;
            }
            case 'stamp': {
              drawX = pW - textWidth - 48;
              drawY = 48;
              break;
            }
          }

          page.drawText(text, {
            x: drawX,
            y: drawY,
            size: fontSize,
            font,
            color: PDFLib.rgb(r, g, b),
            opacity,
            rotate: PDFLib.degrees(rotationDeg)
          });
        }
      } else {
        // Image Mode
        let embeddedImage;
        if (this.imageType === 'png') {
          embeddedImage = await pdfDoc.embedPng(this.imageBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(this.imageBuffer);
        }

        const opacity = parseFloat(this.wmImgOpacity.value);
        const scalePercent = parseInt(this.wmImgScale.value, 10) / 100;
        const rotationDeg = parseInt(this.wmImgRotation.value, 10);
        const rad = (rotationDeg * Math.PI) / 180;

        for (let i = 0; i < totalPages; i++) {
          if (!this.isPageSelected(i, totalPages, targetMode)) continue;

          const page = pages[i];
          const { width: pW, height: pH } = page.getSize();

          // Calculate scaled dimensions relative to page width
          const targetWidth = pW * scalePercent;
          const imgAspect = embeddedImage.width / embeddedImage.height;
          const imgW = targetWidth;
          const imgH = targetWidth / imgAspect;

          let drawX = 0;
          let drawY = 0;

          switch (this.currentImgPreset) {
            case 'diagonal-center':
            case 'center': {
              const offsetX = (imgW / 2) * Math.cos(rad) - (imgH / 2) * Math.sin(rad);
              const offsetY = (imgW / 2) * Math.sin(rad) + (imgH / 2) * Math.cos(rad);
              drawX = pW / 2 - offsetX;
              drawY = pH / 2 - offsetY;
              break;
            }
            case 'top-left': {
              drawX = 36;
              drawY = pH - 36 - imgH;
              break;
            }
            case 'bottom-right': {
              drawX = pW - 36 - imgW;
              drawY = 36;
              break;
            }
            case 'stamp': {
              drawX = pW - imgW - 48;
              drawY = 48;
              break;
            }
          }

          page.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: imgW,
            height: imgH,
            opacity,
            rotate: PDFLib.degrees(rotationDeg)
          });
        }
      }

      const watermarkedBytes = await pdfDoc.save();
      const blob = new Blob([watermarkedBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const baseName = this.currentFile.name.replace(/\.pdf$/i, '');
      const downloadName = `${baseName}_watermarked.pdf`;

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

    } catch (e) {
      console.error(e);
      alert('Error applying watermark: ' + e.message);
    } finally {
      this.btnProcess.disabled = false;
      this.btnProcessText.textContent = 'Download Watermarked PDF';
    }
  }

  reset() {
    this.currentFile = null;
    this.fileBuffer = null;
    this.fileInput.value = '';
    this.workspace.style.display = 'none';
    this.uploadZone.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.pdfWatermarker = new PdfWatermarker();
});