// Product Packaging Mockup Studio Client-Side Logic

class PackagingStudio {
  constructor() {
    this.model = 'box'; // 'box', 'pouch', 'bottle', 'can', 'tumbler'
    this.colors = {
      body: '#1c1f24',
      cap: '#c5a059',
      seal: '#ffffff'
    };
    this.finish = 'matte'; // 'matte', 'gloss', 'metallic'
    this.lighting = {
      angle: 45, // degrees
      intensity: 1.0,
      shadowSoftness: 60
    };
    this.rotation = 0; // degrees (-45 to 45)
    this.stageBg = 'bg-dark-studio'; // 'bg-dark-studio', 'bg-light-studio', 'bg-pedestal', 'bg-transparent-grid'
    
    this.branding = {
      emblem: 'crown', // 'crown', 'monogram', 'leaf', 'tech', 'serif', 'seal'
      customImage: null,
      title: 'LUMIÈRE',
      subtitle: 'RÉSERVE PRIVÉE',
      scale: 1.0,
      offsetY: 0
    };

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartRotation = 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const studio = new PackagingStudio();

  // Canvas elements
  const canvas = document.getElementById('mockup-canvas');
  const ctx = canvas.getContext('2d');
  const canvasContainer = document.getElementById('canvas-container');
  const badgeModelName = document.getElementById('badge-model-name');

  // Model Selection
  const modelBtns = document.querySelectorAll('.model-select-btn');

  // Label & Branding Inputs
  const labelFileInput = document.getElementById('label-file-input');
  const btnClearLabel = document.getElementById('btn-clear-label');
  const emblemBtns = document.querySelectorAll('.emblem-preset-btn');
  const brandTextInput = document.getElementById('brand-text');
  const taglineTextInput = document.getElementById('tagline-text');
  const labelScaleSlider = document.getElementById('label-scale');
  const labelScaleVal = document.getElementById('label-scale-val');
  const labelOffsetYSlider = document.getElementById('label-offset-y');
  const labelOffsetVal = document.getElementById('label-offset-val');

  // Color Pickers & Palettes
  const colorBody = document.getElementById('color-body');
  const colorBodyHex = document.getElementById('color-body-hex');
  const colorCap = document.getElementById('color-cap');
  const colorCapHex = document.getElementById('color-cap-hex');
  const colorSeal = document.getElementById('color-seal');
  const colorSealHex = document.getElementById('color-seal-hex');
  const paletteChips = document.querySelectorAll('.palette-chip');
  const finishBtns = document.querySelectorAll('.finish-btn');

  // Lighting & View Sliders
  const lightAngleSlider = document.getElementById('light-angle');
  const lightAngleVal = document.getElementById('light-angle-val');
  const modelRotationSlider = document.getElementById('model-rotation');
  const modelRotationVal = document.getElementById('model-rotation-val');
  const shadowSoftnessSlider = document.getElementById('shadow-softness');
  const shadowSoftnessVal = document.getElementById('shadow-softness-val');

  // Stage Toolbar & Actions
  const backdropBtns = document.querySelectorAll('.backdrop-btn');
  const btnResetView = document.getElementById('btn-reset-view');
  const btnDownloadHighRes = document.getElementById('btn-download-highres');
  const btnDownloadTransparent = document.getElementById('btn-download-transparent');
  const btnCopyClipboard = document.getElementById('btn-copy-clipboard');

  // Model Labels
  const MODEL_NAMES = {
    box: 'Standing Retail Box',
    pouch: 'Stand-Up Coffee / Snack Pouch',
    bottle: 'Cosmetic Dropper Bottle',
    can: 'Aluminum Beverage Can',
    tumbler: 'Insulated Coffee Tumbler'
  };

  // Toast Helper
  function showToast(message, type = 'info') {
    const existing = document.getElementById('mockup-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'mockup-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${type === 'error' ? 'var(--danger, #ef4444)' : 'var(--accent, #4e85bf)'};
      color: #ffffff;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-md, 8px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      z-index: 10000;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Color Utility Functions
  function hexToRgb(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function adjustBrightness(hex, factor) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r * factor, g * factor, b * factor);
  }

  function rgbaStr(hex, alpha = 1.0) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function lerpColor(hexA, hexB, t) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    return rgbToHex(
      a.r + (b.r - a.r) * t,
      a.g + (b.g - a.g) * t,
      a.b + (b.b - a.b) * t
    );
  }

  // Sync Color Inputs
  function updateColor(type, hex) {
    studio.colors[type] = hex;
    if (type === 'body') {
      colorBody.value = hex;
      colorBodyHex.value = hex.toUpperCase();
    } else if (type === 'cap') {
      colorCap.value = hex;
      colorCapHex.value = hex.toUpperCase();
    } else if (type === 'seal') {
      colorSeal.value = hex;
      colorSealHex.value = hex.toUpperCase();
    }
    renderScene();
  }

  colorBody.addEventListener('input', e => updateColor('body', e.target.value));
  colorBodyHex.addEventListener('change', e => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateColor('body', e.target.value);
  });

  colorCap.addEventListener('input', e => updateColor('cap', e.target.value));
  colorCapHex.addEventListener('change', e => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateColor('cap', e.target.value);
  });

  colorSeal.addEventListener('input', e => updateColor('seal', e.target.value));
  colorSealHex.addEventListener('change', e => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateColor('seal', e.target.value);
  });

  // Palette Chips
  paletteChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const b = chip.getAttribute('data-body');
      const c = chip.getAttribute('data-cap');
      const s = chip.getAttribute('data-seal');
      if (b) updateColor('body', b);
      if (c) updateColor('cap', c);
      if (s) updateColor('seal', s);
      showToast(`Applied ${chip.textContent.trim()} palette`);
    });
  });

  // Model Selection
  modelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const model = btn.getAttribute('data-model');
      studio.model = model;
      badgeModelName.textContent = MODEL_NAMES[model] || 'Packaging Model';
      renderScene();
    });
  });

  // Finish Selector
  finishBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      finishBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      studio.finish = btn.getAttribute('data-finish');
      renderScene();
    });
  });

  // Emblem Preset Buttons
  emblemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      emblemBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      studio.branding.emblem = btn.getAttribute('data-emblem');
      studio.branding.customImage = null;
      labelFileInput.value = '';
      renderScene();
    });
  });

  // Custom File Upload
  labelFileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          studio.branding.customImage = img;
          emblemBtns.forEach(b => b.classList.remove('active'));
          renderScene();
          showToast('Custom logo applied to packaging!');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  btnClearLabel.addEventListener('click', () => {
    studio.branding.customImage = null;
    labelFileInput.value = '';
    const firstEmblem = document.querySelector('.emblem-preset-btn[data-emblem="crown"]');
    if (firstEmblem) firstEmblem.click();
  });

  // Brand and Subtitle Inputs
  brandTextInput.addEventListener('input', e => {
    studio.branding.title = e.target.value.trim();
    renderScene();
  });

  taglineTextInput.addEventListener('input', e => {
    studio.branding.subtitle = e.target.value.trim();
    renderScene();
  });

  labelScaleSlider.addEventListener('input', e => {
    studio.branding.scale = parseFloat(e.target.value) / 100;
    labelScaleVal.textContent = `${e.target.value}%`;
    renderScene();
  });

  labelOffsetYSlider.addEventListener('input', e => {
    studio.branding.offsetY = parseInt(e.target.value, 10);
    labelOffsetVal.textContent = e.target.value;
    renderScene();
  });

  // Lighting & Rotation Sliders
  lightAngleSlider.addEventListener('input', e => {
    studio.lighting.angle = parseInt(e.target.value, 10);
    lightAngleVal.textContent = `${e.target.value}°`;
    renderScene();
  });

  modelRotationSlider.addEventListener('input', e => {
    studio.rotation = parseInt(e.target.value, 10);
    modelRotationVal.textContent = `${e.target.value}°`;
    renderScene();
  });

  shadowSoftnessSlider.addEventListener('input', e => {
    studio.lighting.shadowSoftness = parseInt(e.target.value, 10);
    shadowSoftnessVal.textContent = `${e.target.value}%`;
    renderScene();
  });

  // Backdrop Switching
  backdropBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      backdropBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const bg = btn.getAttribute('data-bg');
      studio.stageBg = bg;
      canvasContainer.className = `stage-canvas-container ${bg}`;
      renderScene();
    });
  });

  // Reset View
  btnResetView.addEventListener('click', () => {
    studio.rotation = 0;
    modelRotationSlider.value = 0;
    modelRotationVal.textContent = '0°';
    studio.lighting.angle = 45;
    lightAngleSlider.value = 45;
    lightAngleVal.textContent = '45°';
    renderScene();
    showToast('Reset view rotation and lighting.');
  });

  // Drag-to-Rotate on Canvas
  canvasContainer.addEventListener('mousedown', e => {
    studio.isDragging = true;
    studio.dragStartX = e.clientX;
    studio.dragStartRotation = studio.rotation;
  });

  window.addEventListener('mousemove', e => {
    if (!studio.isDragging) return;
    const deltaX = e.clientX - studio.dragStartX;
    const newRot = Math.max(-45, Math.min(45, studio.dragStartRotation + deltaX * 0.25));
    studio.rotation = Math.round(newRot);
    modelRotationSlider.value = studio.rotation;
    modelRotationVal.textContent = `${studio.rotation}°`;
    renderScene();
  });

  window.addEventListener('mouseup', () => {
    studio.isDragging = false;
  });

  // Touch Support
  canvasContainer.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      studio.isDragging = true;
      studio.dragStartX = e.touches[0].clientX;
      studio.dragStartRotation = studio.rotation;
    }
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (!studio.isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - studio.dragStartX;
    const newRot = Math.max(-45, Math.min(45, studio.dragStartRotation + deltaX * 0.3));
    studio.rotation = Math.round(newRot);
    modelRotationSlider.value = studio.rotation;
    modelRotationVal.textContent = `${studio.rotation}°`;
    renderScene();
  }, { passive: true });

  window.addEventListener('touchend', () => {
    studio.isDragging = false;
  });

  // -------------------------------------------------------------
  // RENDERING ENGINE
  // -------------------------------------------------------------

  function drawEmblem(targetCtx, x, y, size, color) {
    targetCtx.save();
    targetCtx.translate(x, y);
    targetCtx.strokeStyle = color;
    targetCtx.fillStyle = color;
    targetCtx.lineWidth = Math.max(2, size * 0.05);
    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';

    const s = size / 24;

    switch (studio.branding.emblem) {
      case 'crown':
        // Royal Heraldic Crown
        targetCtx.beginPath();
        targetCtx.moveTo(-10 * s, -3 * s);
        targetCtx.lineTo(-7 * s, 6 * s);
        targetCtx.lineTo(7 * s, 6 * s);
        targetCtx.lineTo(10 * s, -3 * s);
        targetCtx.lineTo(4 * s, 2 * s);
        targetCtx.lineTo(0, -5 * s);
        targetCtx.lineTo(-4 * s, 2 * s);
        targetCtx.closePath();
        targetCtx.stroke();
        // Crown Base Band
        targetCtx.beginPath();
        targetCtx.rect(-7 * s, 8 * s, 14 * s, 2.5 * s);
        targetCtx.fill();
        // Top Jewels
        targetCtx.beginPath();
        targetCtx.arc(-10 * s, -3 * s, 1.5 * s, 0, Math.PI * 2);
        targetCtx.arc(0, -5 * s, 1.8 * s, 0, Math.PI * 2);
        targetCtx.arc(10 * s, -3 * s, 1.5 * s, 0, Math.PI * 2);
        targetCtx.fill();
        break;

      case 'monogram':
        // Modern Overlapping Monogram
        targetCtx.beginPath();
        targetCtx.moveTo(-9 * s, 9 * s);
        targetCtx.lineTo(-9 * s, -9 * s);
        targetCtx.lineTo(0, 1 * s);
        targetCtx.lineTo(9 * s, -9 * s);
        targetCtx.lineTo(9 * s, 9 * s);
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.moveTo(-4 * s, -9 * s);
        targetCtx.lineTo(4 * s, -9 * s);
        targetCtx.stroke();
        break;

      case 'leaf':
        // Botanical Organic Leaf
        targetCtx.beginPath();
        targetCtx.moveTo(0, 9 * s);
        targetCtx.bezierCurveTo(-9 * s, 5 * s, -9 * s, -5 * s, 0, -10 * s);
        targetCtx.bezierCurveTo(9 * s, -5 * s, 9 * s, 5 * s, 0, 9 * s);
        targetCtx.stroke();
        // Stem and Veins
        targetCtx.beginPath();
        targetCtx.moveTo(0, 9 * s);
        targetCtx.lineTo(0, -6 * s);
        targetCtx.moveTo(0, 2 * s);
        targetCtx.lineTo(-4 * s, -1 * s);
        targetCtx.moveTo(0, -2 * s);
        targetCtx.lineTo(4 * s, -5 * s);
        targetCtx.stroke();
        break;

      case 'tech':
        // Futuristic Hexagon Cube
        targetCtx.beginPath();
        targetCtx.moveTo(0, -10 * s);
        targetCtx.lineTo(9 * s, -5 * s);
        targetCtx.lineTo(9 * s, 5 * s);
        targetCtx.lineTo(0, 10 * s);
        targetCtx.lineTo(-9 * s, 5 * s);
        targetCtx.lineTo(-9 * s, -5 * s);
        targetCtx.closePath();
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.moveTo(0, 0);
        targetCtx.lineTo(0, 10 * s);
        targetCtx.moveTo(0, 0);
        targetCtx.lineTo(-9 * s, -5 * s);
        targetCtx.moveTo(0, 0);
        targetCtx.lineTo(9 * s, -5 * s);
        targetCtx.stroke();
        break;

      case 'serif':
        // Modern Starburst / Editorial Asterism
        targetCtx.beginPath();
        targetCtx.moveTo(0, -10 * s);
        targetCtx.lineTo(3 * s, -3 * s);
        targetCtx.lineTo(10 * s, 0);
        targetCtx.lineTo(3 * s, 3 * s);
        targetCtx.lineTo(0, 10 * s);
        targetCtx.lineTo(-3 * s, 3 * s);
        targetCtx.lineTo(-10 * s, 0);
        targetCtx.lineTo(-3 * s, -3 * s);
        targetCtx.closePath();
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.arc(0, 0, 2 * s, 0, Math.PI * 2);
        targetCtx.fill();
        break;

      case 'seal':
        // Heritage Circular Stamp Seal
        targetCtx.beginPath();
        targetCtx.arc(0, 0, 9 * s, 0, Math.PI * 2);
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.arc(0, 0, 6 * s, 0, Math.PI * 2);
        targetCtx.stroke();
        targetCtx.beginPath();
        targetCtx.arc(0, 0, 2 * s, 0, Math.PI * 2);
        targetCtx.fill();
        break;
    }

    targetCtx.restore();
  }

  // Draw Brand Typography & Label
  function drawBrandLabel(targetCtx, cx, cy, maxWidth, maxHeight, textColor = '#ffffff') {
    targetCtx.save();
    targetCtx.translate(cx, cy + studio.branding.offsetY);
    targetCtx.scale(studio.branding.scale, studio.branding.scale);

    const emblemSize = Math.min(52, maxWidth * 0.4);

    if (studio.branding.customImage) {
      const img = studio.branding.customImage;
      const aspect = img.width / img.height;
      let drawW = maxWidth * 0.7;
      let drawH = drawW / aspect;
      if (drawH > maxHeight * 0.45) {
        drawH = maxHeight * 0.45;
        drawW = drawH * aspect;
      }
      targetCtx.drawImage(img, -drawW / 2, -emblemSize - drawH / 2, drawW, drawH);
    } else {
      drawEmblem(targetCtx, 0, -emblemSize / 2, emblemSize, textColor);
    }

    // Brand Title
    if (studio.branding.title) {
      targetCtx.fillStyle = textColor;
      targetCtx.textAlign = 'center';
      targetCtx.textBaseline = 'middle';
      targetCtx.font = `700 20px "Instrument Serif", "Times New Roman", serif`;
      targetCtx.letterSpacing = '2px';
      targetCtx.fillText(studio.branding.title, 0, emblemSize * 0.65);
    }

    // Subtitle
    if (studio.branding.subtitle) {
      targetCtx.fillStyle = rgbaStr(textColor, 0.75);
      targetCtx.textAlign = 'center';
      targetCtx.textBaseline = 'middle';
      targetCtx.font = `600 9px "Inter", sans-serif`;
      targetCtx.letterSpacing = '3px';
      targetCtx.fillText(studio.branding.subtitle.toUpperCase(), 0, emblemSize * 0.65 + 20);
    }

    targetCtx.restore();
  }

  // Draw Contact & Ground Shadow
  function drawGroundShadow(targetCtx, cx, cy, width, height, softness) {
    targetCtx.save();
    const lightRad = (studio.lighting.angle * Math.PI) / 180;
    const shadowOffsetX = -Math.cos(lightRad) * 60;
    const shadowOffsetY = 15 + Math.sin(lightRad) * 20;

    const grad = targetCtx.createRadialGradient(
      cx + shadowOffsetX, cy + shadowOffsetY, width * 0.1,
      cx + shadowOffsetX, cy + shadowOffsetY, width * (softness / 50)
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    targetCtx.fillStyle = grad;
    targetCtx.beginPath();
    targetCtx.ellipse(cx + shadowOffsetX, cy + shadowOffsetY, width * 0.9, height * 0.6, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.restore();
  }

  // Material Finish Overlay Helper
  function applyFinishHighlight(targetCtx, pathFn, isCurved = false) {
    if (studio.finish === 'matte') return;

    targetCtx.save();
    targetCtx.beginPath();
    pathFn();
    targetCtx.clip();

    const lightRad = (studio.lighting.angle * Math.PI) / 180;
    const lx = Math.cos(lightRad);

    if (studio.finish === 'gloss') {
      targetCtx.globalCompositeOperation = 'screen';
      const shineGrad = targetCtx.createLinearGradient(
        canvas.width * 0.3 + lx * 200, 0,
        canvas.width * 0.7 + lx * 200, canvas.height
      );
      shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      shineGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.05)');
      shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
      shineGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.05)');
      shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      targetCtx.fillStyle = shineGrad;
      targetCtx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (studio.finish === 'metallic') {
      targetCtx.globalCompositeOperation = 'overlay';
      const foilGrad = targetCtx.createLinearGradient(
        canvas.width * 0.2, 0,
        canvas.width * 0.8, canvas.height
      );
      foilGrad.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
      foilGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.5)');
      foilGrad.addColorStop(0.5, 'rgba(180, 140, 40, 0.2)');
      foilGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.6)');
      foilGrad.addColorStop(1, 'rgba(255, 215, 0, 0.2)');
      targetCtx.fillStyle = foilGrad;
      targetCtx.fillRect(0, 0, canvas.width, canvas.height);
    }

    targetCtx.restore();
  }

  // -------------------------------------------------------------
  // MODEL 1: STANDING RETAIL / SOFTWARE BOX
  // -------------------------------------------------------------
  function drawRetailBox(targetCtx) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 50;

    // Dimensions
    const boxW = 340;
    const boxH = 480;
    const boxD = 130;

    // Perspective angle derived from rotation
    const rot = (studio.rotation * Math.PI) / 180;
    const yaw = Math.sin(rot) * 0.6; // -0.6 to 0.6

    // Perspective calculations
    const frontW = boxW * (0.85 - yaw * 0.25);
    const sideW = boxD * (0.6 + yaw * 0.4);
    const skewY = 32 - yaw * 20;
    const topH = 55 + Math.abs(yaw) * 15;

    // Base coordinates
    const pCenter = { x: cx - (yaw * 60), y: cy };
    const pFrontLeft = { x: pCenter.x - frontW, y: pCenter.y + skewY };
    const pFrontRight = { x: pCenter.x, y: pCenter.y };
    const pFrontTopLeft = { x: pCenter.x - frontW, y: pCenter.y + skewY - boxH };
    const pFrontTopRight = { x: pCenter.x, y: pCenter.y - boxH };

    const pSideRight = { x: pCenter.x + sideW, y: pCenter.y - skewY * 0.8 };
    const pSideTopRight = { x: pCenter.x + sideW, y: pCenter.y - skewY * 0.8 - boxH };

    const pTopBack = { x: pCenter.x - frontW + sideW, y: pCenter.y - boxH - topH };

    // Ground Shadow
    drawGroundShadow(targetCtx, pCenter.x, pCenter.y + 20, (frontW + sideW) * 1.2, 50, studio.lighting.shadowSoftness);

    // Light calculation
    const lightAngle = studio.lighting.angle;
    const lightRad = (lightAngle * Math.PI) / 180;
    const lightFactor = Math.cos(lightRad);

    // 1. Top Face
    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(pFrontTopLeft.x, pFrontTopLeft.y);
    targetCtx.lineTo(pTopBack.x, pTopBack.y);
    targetCtx.lineTo(pSideTopRight.x, pSideTopRight.y);
    targetCtx.lineTo(pFrontTopRight.x, pFrontTopRight.y);
    targetCtx.closePath();
    const topColor = adjustBrightness(studio.colors.body, 1.25);
    targetCtx.fillStyle = topColor;
    targetCtx.fill();
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    targetCtx.lineWidth = 1;
    targetCtx.stroke();
    targetCtx.restore();

    // 2. Side Face (Spine)
    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(pFrontRight.x, pFrontRight.y);
    targetCtx.lineTo(pSideRight.x, pSideRight.y);
    targetCtx.lineTo(pSideTopRight.x, pSideTopRight.y);
    targetCtx.lineTo(pFrontTopRight.x, pFrontTopRight.y);
    targetCtx.closePath();
    const sideShading = 0.65 - (lightFactor * 0.2);
    const sideColor = adjustBrightness(studio.colors.body, Math.max(0.2, sideShading));
    targetCtx.fillStyle = sideColor;
    targetCtx.fill();

    // Side Accent Band
    targetCtx.strokeStyle = studio.colors.cap;
    targetCtx.lineWidth = 6;
    targetCtx.beginPath();
    targetCtx.moveTo(pFrontRight.x, pFrontRight.y - 40);
    targetCtx.lineTo(pSideRight.x, pSideRight.y - 40);
    targetCtx.stroke();
    targetCtx.restore();

    // 3. Front Face
    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(pFrontLeft.x, pFrontLeft.y);
    targetCtx.lineTo(pFrontRight.x, pFrontRight.y);
    targetCtx.lineTo(pFrontTopRight.x, pFrontTopRight.y);
    targetCtx.lineTo(pFrontTopLeft.x, pFrontTopLeft.y);
    targetCtx.closePath();

    const frontGrad = targetCtx.createLinearGradient(
      pFrontLeft.x, pFrontTopLeft.y,
      pFrontRight.x, pFrontRight.y
    );
    const frontBright = 0.95 + (lightFactor * 0.35);
    frontGrad.addColorStop(0, adjustBrightness(studio.colors.body, frontBright * 0.85));
    frontGrad.addColorStop(1, adjustBrightness(studio.colors.body, frontBright * 1.1));
    targetCtx.fillStyle = frontGrad;
    targetCtx.fill();

    // Edge highlight
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    targetCtx.lineWidth = 1.5;
    targetCtx.stroke();

    // Finish Highlight
    applyFinishHighlight(targetCtx, () => {
      targetCtx.moveTo(pFrontLeft.x, pFrontLeft.y);
      targetCtx.lineTo(pFrontRight.x, pFrontRight.y);
      targetCtx.lineTo(pFrontTopRight.x, pFrontTopRight.y);
      targetCtx.lineTo(pFrontTopLeft.x, pFrontTopLeft.y);
    });

    // Front Brand Label Drawing
    const frontCenterX = (pFrontLeft.x + pFrontRight.x) / 2;
    const frontCenterY = (pFrontTopLeft.y + pFrontLeft.y) / 2;

    // Skew context slightly to match perspective
    targetCtx.save();
    targetCtx.translate(frontCenterX, frontCenterY);
    targetCtx.transform(1, (skewY / frontW) * 0.8, 0, 1, 0, 0);
    drawBrandLabel(targetCtx, 0, 0, frontW * 0.75, boxH * 0.7, studio.colors.seal);
    targetCtx.restore();

    targetCtx.restore();
  }

  // -------------------------------------------------------------
  // MODEL 2: STAND-UP POUCH (SNACK / COFFEE)
  // -------------------------------------------------------------
  function drawStandUpPouch(targetCtx) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 50;

    const pw = 360;
    const ph = 500;
    const rot = (studio.rotation * Math.PI) / 180;
    const rotOffset = Math.sin(rot) * 40;

    // Ground Shadow
    drawGroundShadow(targetCtx, cx + rotOffset, cy + 25, pw * 0.95, 45, studio.lighting.shadowSoftness);

    // Light calculation
    const lightAngle = studio.lighting.angle;
    const lightRad = (lightAngle * Math.PI) / 180;
    const lx = Math.cos(lightRad);

    // 1. Pouch Body Outer Contour Path
    function pouchPath() {
      targetCtx.moveTo(cx - pw * 0.42 + rotOffset, cy - ph); // Top Left
      targetCtx.lineTo(cx + pw * 0.42 + rotOffset, cy - ph); // Top Right
      // Right gusset & belly curve
      targetCtx.bezierCurveTo(
        cx + pw * 0.48 + rotOffset, cy - ph * 0.6,
        cx + pw * 0.52 + rotOffset, cy - ph * 0.2,
        cx + pw * 0.40 + rotOffset, cy
      );
      // Bottom Oval Base
      targetCtx.bezierCurveTo(
        cx + pw * 0.2 + rotOffset, cy + 18,
        cx - pw * 0.2 + rotOffset, cy + 18,
        cx - pw * 0.40 + rotOffset, cy
      );
      // Left gusset & belly curve
      targetCtx.bezierCurveTo(
        cx - pw * 0.52 + rotOffset, cy - ph * 0.2,
        cx - pw * 0.48 + rotOffset, cy - ph * 0.6,
        cx - pw * 0.42 + rotOffset, cy - ph
      );
      targetCtx.closePath();
    }

    targetCtx.save();
    targetCtx.beginPath();
    pouchPath();

    // Cylindrical & Volumetric Gradient
    const pouchGrad = targetCtx.createLinearGradient(
      cx - pw * 0.5 + rotOffset, 0,
      cx + pw * 0.5 + rotOffset, 0
    );
    const highlightPos = 0.5 + (lx * 0.3);
    pouchGrad.addColorStop(0, adjustBrightness(studio.colors.body, 0.65));
    pouchGrad.addColorStop(Math.max(0.1, highlightPos - 0.25), adjustBrightness(studio.colors.body, 0.85));
    pouchGrad.addColorStop(Math.min(0.9, Math.max(0.1, highlightPos)), adjustBrightness(studio.colors.body, 1.25));
    pouchGrad.addColorStop(Math.min(0.9, highlightPos + 0.25), adjustBrightness(studio.colors.body, 0.9));
    pouchGrad.addColorStop(1, adjustBrightness(studio.colors.body, 0.55));
    targetCtx.fillStyle = pouchGrad;
    targetCtx.fill();

    // Subtle 3D creases / Gusset Shadows
    targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - pw * 0.38 + rotOffset, cy - ph * 0.85);
    targetCtx.quadraticCurveTo(cx - pw * 0.32 + rotOffset, cy - ph * 0.4, cx - pw * 0.34 + rotOffset, cy - 10);
    targetCtx.stroke();

    targetCtx.beginPath();
    targetCtx.moveTo(cx + pw * 0.38 + rotOffset, cy - ph * 0.85);
    targetCtx.quadraticCurveTo(cx + pw * 0.32 + rotOffset, cy - ph * 0.4, cx + pw * 0.34 + rotOffset, cy - 10);
    targetCtx.stroke();

    // Top Heat Seal Bar
    const sealH = 50;
    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.rect(cx - pw * 0.43 + rotOffset, cy - ph - 2, pw * 0.86, sealH);
    targetCtx.clip();

    targetCtx.fillStyle = adjustBrightness(studio.colors.cap, 0.9);
    targetCtx.fillRect(cx - pw * 0.45 + rotOffset, cy - ph - 5, pw * 0.9, sealH + 10);

    // Heat seal grip ribs
    targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    targetCtx.lineWidth = 1.5;
    for (let rx = cx - pw * 0.42 + rotOffset; rx < cx + pw * 0.42 + rotOffset; rx += 8) {
      targetCtx.beginPath();
      targetCtx.moveTo(rx, cy - ph);
      targetCtx.lineTo(rx, cy - ph + sealH - 8);
      targetCtx.stroke();
    }

    // Tear notch on left & right
    targetCtx.fillStyle = '#0f1115';
    targetCtx.beginPath();
    targetCtx.moveTo(cx - pw * 0.43 + rotOffset, cy - ph + 24);
    targetCtx.lineTo(cx - pw * 0.41 + rotOffset, cy - ph + 28);
    targetCtx.lineTo(cx - pw * 0.43 + rotOffset, cy - ph + 32);
    targetCtx.fill();

    targetCtx.restore();

    // Material Finish
    applyFinishHighlight(targetCtx, pouchPath, true);

    // Label & Emblem on Front Belly
    drawBrandLabel(targetCtx, cx + rotOffset, cy - ph * 0.45, pw * 0.65, ph * 0.5, studio.colors.seal);

    targetCtx.restore();
  }

  // -------------------------------------------------------------
  // MODEL 3: COSMETIC DROPPER BOTTLE
  // -------------------------------------------------------------
  function drawDropperBottle(targetCtx) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 70;

    const bottleW = 210;
    const bottleH = 400;
    const rot = (studio.rotation * Math.PI) / 180;
    const rotOffset = Math.sin(rot) * 35;

    // Ground Shadow
    drawGroundShadow(targetCtx, cx + rotOffset, cy + 18, bottleW * 0.85, 38, studio.lighting.shadowSoftness);

    const lightAngle = studio.lighting.angle;
    const lightRad = (lightAngle * Math.PI) / 180;
    const lx = Math.cos(lightRad);

    // 1. Pipette Rubber Squeeze Bulb
    const bulbW = 68;
    const bulbH = 75;
    const bulbY = cy - bottleH - 95;

    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(cx - bulbW / 2 + rotOffset, bulbY + bulbH);
    targetCtx.bezierCurveTo(
      cx - bulbW * 0.7 + rotOffset, bulbY + bulbH * 0.5,
      cx - bulbW * 0.4 + rotOffset, bulbY,
      cx + rotOffset, bulbY
    );
    targetCtx.bezierCurveTo(
      cx + bulbW * 0.4 + rotOffset, bulbY,
      cx + bulbW * 0.7 + rotOffset, bulbY + bulbH * 0.5,
      cx + bulbW / 2 + rotOffset, bulbY + bulbH
    );
    targetCtx.closePath();

    const bulbGrad = targetCtx.createLinearGradient(
      cx - bulbW / 2 + rotOffset, 0,
      cx + bulbW / 2 + rotOffset, 0
    );
    bulbGrad.addColorStop(0, adjustBrightness(studio.colors.cap, 0.7));
    bulbGrad.addColorStop(0.4, adjustBrightness(studio.colors.cap, 1.2));
    bulbGrad.addColorStop(1, adjustBrightness(studio.colors.cap, 0.5));
    targetCtx.fillStyle = bulbGrad;
    targetCtx.fill();
    targetCtx.restore();

    // 2. Metallic Dropper Collar Ring
    const collarW = 82;
    const collarH = 34;
    const collarY = bulbY + bulbH - 4;

    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.rect(cx - collarW / 2 + rotOffset, collarY, collarW, collarH);
    const collarGrad = targetCtx.createLinearGradient(
      cx - collarW / 2 + rotOffset, 0,
      cx + collarW / 2 + rotOffset, 0
    );
    collarGrad.addColorStop(0, adjustBrightness(studio.colors.seal, 0.6));
    collarGrad.addColorStop(0.3, adjustBrightness(studio.colors.seal, 1.3));
    collarGrad.addColorStop(0.6, adjustBrightness(studio.colors.seal, 0.7));
    collarGrad.addColorStop(1, adjustBrightness(studio.colors.seal, 0.5));
    targetCtx.fillStyle = collarGrad;
    targetCtx.fill();
    targetCtx.restore();

    // 3. Glass Bottle Body Path
    function bottlePath() {
      const neckW = 54;
      const shoulderY = cy - bottleH + 30;
      targetCtx.moveTo(cx - neckW / 2 + rotOffset, collarY + collarH);
      targetCtx.lineTo(cx + neckW / 2 + rotOffset, collarY + collarH);
      targetCtx.lineTo(cx + neckW / 2 + rotOffset, shoulderY);
      // Right shoulder curve
      targetCtx.bezierCurveTo(
        cx + bottleW * 0.4 + rotOffset, shoulderY,
        cx + bottleW / 2 + rotOffset, shoulderY + 20,
        cx + bottleW / 2 + rotOffset, shoulderY + 50
      );
      // Straight right side
      targetCtx.lineTo(cx + bottleW / 2 + rotOffset, cy - 20);
      // Bottom rounded corners
      targetCtx.quadraticCurveTo(cx + bottleW / 2 + rotOffset, cy, cx + bottleW * 0.35 + rotOffset, cy);
      targetCtx.lineTo(cx - bottleW * 0.35 + rotOffset, cy);
      targetCtx.quadraticCurveTo(cx - bottleW / 2 + rotOffset, cy, cx - bottleW / 2 + rotOffset, cy - 20);
      // Straight left side
      targetCtx.lineTo(cx - bottleW / 2 + rotOffset, shoulderY + 50);
      // Left shoulder curve
      targetCtx.bezierCurveTo(
        cx - bottleW / 2 + rotOffset, shoulderY + 20,
        cx - bottleW * 0.4 + rotOffset, shoulderY,
        cx - neckW / 2 + rotOffset, shoulderY
      );
      targetCtx.closePath();
    }

    targetCtx.save();
    targetCtx.beginPath();
    bottlePath();

    // Glass / Liquid Body Gradient
    const glassGrad = targetCtx.createLinearGradient(
      cx - bottleW / 2 + rotOffset, 0,
      cx + bottleW / 2 + rotOffset, 0
    );
    const hl = 0.5 + lx * 0.35;
    glassGrad.addColorStop(0, adjustBrightness(studio.colors.body, 0.45));
    glassGrad.addColorStop(Math.max(0.05, hl - 0.2), adjustBrightness(studio.colors.body, 0.8));
    glassGrad.addColorStop(Math.min(0.95, Math.max(0.05, hl)), adjustBrightness(studio.colors.body, 1.4));
    glassGrad.addColorStop(Math.min(0.95, hl + 0.2), adjustBrightness(studio.colors.body, 0.7));
    glassGrad.addColorStop(1, adjustBrightness(studio.colors.body, 0.4));
    targetCtx.fillStyle = glassGrad;
    targetCtx.fill();

    // Thick Glass Bottom Base
    targetCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    targetCtx.beginPath();
    targetCtx.rect(cx - bottleW / 2 + rotOffset, cy - 25, bottleW, 25);
    targetCtx.fill();

    // Glass Wall Highlights
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    targetCtx.lineWidth = 3;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - bottleW * 0.44 + rotOffset, cy - bottleH * 0.75);
    targetCtx.lineTo(cx - bottleW * 0.44 + rotOffset, cy - 30);
    targetCtx.stroke();

    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(cx + bottleW * 0.44 + rotOffset, cy - bottleH * 0.75);
    targetCtx.lineTo(cx + bottleW * 0.44 + rotOffset, cy - 30);
    targetCtx.stroke();

    // Wraparound Label Band
    const labelW = bottleW * 0.88;
    const labelH = 190;
    const labelY = cy - bottleH * 0.62;

    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.roundRect(cx - labelW / 2 + rotOffset, labelY, labelW, labelH, 6);
    targetCtx.clip();

    // Label Background (Soft warm white or dark contrast)
    const labelBgGrad = targetCtx.createLinearGradient(
      cx - labelW / 2 + rotOffset, 0,
      cx + labelW / 2 + rotOffset, 0
    );
    labelBgGrad.addColorStop(0, '#e5e7eb');
    labelBgGrad.addColorStop(0.5, '#f9fafb');
    labelBgGrad.addColorStop(1, '#d1d5db');
    targetCtx.fillStyle = labelBgGrad;
    targetCtx.fill();

    // Label Border Accent
    targetCtx.strokeStyle = studio.colors.cap;
    targetCtx.lineWidth = 1.5;
    targetCtx.strokeRect(cx - labelW / 2 + rotOffset + 6, labelY + 6, labelW - 12, labelH - 12);

    // Label Typography
    drawBrandLabel(targetCtx, cx + rotOffset, labelY + labelH * 0.45, labelW * 0.8, labelH * 0.7, '#111827');
    targetCtx.restore();

    // Material Finish
    applyFinishHighlight(targetCtx, bottlePath, true);

    targetCtx.restore();
  }

  // -------------------------------------------------------------
  // MODEL 4: ALUMINUM CAN / TIN
  // -------------------------------------------------------------
  function drawAluminumCan(targetCtx) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 55;

    const canW = 240;
    const canH = 460;
    const rot = (studio.rotation * Math.PI) / 180;
    const rotOffset = Math.sin(rot) * 35;

    // Ground Shadow
    drawGroundShadow(targetCtx, cx + rotOffset, cy + 20, canW * 0.95, 40, studio.lighting.shadowSoftness);

    const lightAngle = studio.lighting.angle;
    const lightRad = (lightAngle * Math.PI) / 180;
    const lx = Math.cos(lightRad);

    // Can Geometry
    const rimH = 22;
    const neckInset = 16;

    // 1. Top Aluminum Rim / Chime
    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.ellipse(cx + rotOffset, cy - canH, (canW / 2) - neckInset, rimH, 0, 0, Math.PI * 2);
    const rimGrad = targetCtx.createLinearGradient(
      cx - canW / 2 + rotOffset, 0,
      cx + canW / 2 + rotOffset, 0
    );
    rimGrad.addColorStop(0, '#9ca3af');
    rimGrad.addColorStop(0.3, '#f3f4f6');
    rimGrad.addColorStop(0.7, '#6b7280');
    rimGrad.addColorStop(1, '#d1d5db');
    targetCtx.fillStyle = rimGrad;
    targetCtx.fill();

    // Inner lid indentation
    targetCtx.beginPath();
    targetCtx.ellipse(cx + rotOffset, cy - canH + 2, (canW / 2) - neckInset - 8, rimH - 5, 0, 0, Math.PI * 2);
    targetCtx.fillStyle = '#4b5563';
    targetCtx.fill();

    // Pull Tab
    targetCtx.fillStyle = '#e5e7eb';
    targetCtx.beginPath();
    targetCtx.roundRect(cx + rotOffset - 12, cy - canH - 4, 24, 14, 4);
    targetCtx.fill();
    targetCtx.restore();

    // 2. Can Cylindrical Body Path
    function canBodyPath() {
      targetCtx.moveTo(cx - canW / 2 + neckInset + rotOffset, cy - canH + 8);
      // Neck slope
      targetCtx.quadraticCurveTo(
        cx - canW / 2 + rotOffset, cy - canH + 25,
        cx - canW / 2 + rotOffset, cy - canH + 45
      );
      // Straight cylinder side
      targetCtx.lineTo(cx - canW / 2 + rotOffset, cy - 25);
      // Bottom chime slope
      targetCtx.quadraticCurveTo(
        cx - canW / 2 + rotOffset, cy,
        cx - canW / 2 + neckInset + rotOffset, cy
      );
      // Bottom rim
      targetCtx.lineTo(cx + canW / 2 - neckInset + rotOffset, cy);
      // Bottom right slope
      targetCtx.quadraticCurveTo(
        cx + canW / 2 + rotOffset, cy,
        cx + canW / 2 + rotOffset, cy - 25
      );
      // Straight right side
      targetCtx.lineTo(cx + canW / 2 + rotOffset, cy - canH + 45);
      // Top right neck slope
      targetCtx.quadraticCurveTo(
        cx + canW / 2 + rotOffset, cy - canH + 25,
        cx + canW / 2 - neckInset + rotOffset, cy - canH + 8
      );
      targetCtx.closePath();
    }

    targetCtx.save();
    targetCtx.beginPath();
    canBodyPath();

    // Specular Cylindrical Shading (High-reflection Aluminum Bands)
    const canGrad = targetCtx.createLinearGradient(
      cx - canW / 2 + rotOffset, 0,
      cx + canW / 2 + rotOffset, 0
    );
    const hl = 0.5 + lx * 0.35;
    canGrad.addColorStop(0, adjustBrightness(studio.colors.body, 0.5));
    canGrad.addColorStop(Math.max(0.08, hl - 0.25), adjustBrightness(studio.colors.body, 0.85));
    canGrad.addColorStop(Math.min(0.92, Math.max(0.08, hl)), adjustBrightness(studio.colors.body, 1.5));
    canGrad.addColorStop(Math.min(0.92, hl + 0.15), adjustBrightness(studio.colors.body, 0.8));
    canGrad.addColorStop(1, adjustBrightness(studio.colors.body, 0.45));
    targetCtx.fillStyle = canGrad;
    targetCtx.fill();

    // Top & Bottom Aluminum Chime Accents
    targetCtx.fillStyle = studio.colors.cap;
    targetCtx.fillRect(cx - canW / 2 + rotOffset, cy - canH + 40, canW, 6);
    targetCtx.fillRect(cx - canW / 2 + rotOffset, cy - 25, canW, 6);

    // Material Finish
    applyFinishHighlight(targetCtx, canBodyPath, true);

    // Brand Label on Center Cylinder
    drawBrandLabel(targetCtx, cx + rotOffset, cy - canH * 0.5, canW * 0.75, canH * 0.6, studio.colors.seal);

    targetCtx.restore();
  }

  // -------------------------------------------------------------
  // MODEL 5: COFFEE TUMBLER
  // -------------------------------------------------------------
  function drawCoffeeTumbler(targetCtx) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 55;

    const topW = 270;
    const baseW = 190;
    const tumblerH = 460;
    const rot = (studio.rotation * Math.PI) / 180;
    const rotOffset = Math.sin(rot) * 35;

    // Ground Shadow
    drawGroundShadow(targetCtx, cx + rotOffset, cy + 22, baseW * 0.95, 38, studio.lighting.shadowSoftness);

    const lightAngle = studio.lighting.angle;
    const lightRad = (lightAngle * Math.PI) / 180;
    const lx = Math.cos(lightRad);

    // 1. Insulated Tumbler Lid
    const lidW = topW + 12;
    const lidH = 42;
    const lidY = cy - tumblerH - lidH;

    targetCtx.save();
    // Lid Base
    targetCtx.beginPath();
    targetCtx.roundRect(cx - lidW / 2 + rotOffset, lidY + 12, lidW, lidH - 12, 6);
    const lidGrad = targetCtx.createLinearGradient(
      cx - lidW / 2 + rotOffset, 0,
      cx + lidW / 2 + rotOffset, 0
    );
    lidGrad.addColorStop(0, adjustBrightness(studio.colors.cap, 0.7));
    lidGrad.addColorStop(0.4, adjustBrightness(studio.colors.cap, 1.25));
    lidGrad.addColorStop(1, adjustBrightness(studio.colors.cap, 0.55));
    targetCtx.fillStyle = lidGrad;
    targetCtx.fill();

    // Sip Aperture / Slider on Lid Top
    targetCtx.fillStyle = '#0f1115';
    targetCtx.beginPath();
    targetCtx.roundRect(cx + rotOffset - 25, lidY + 14, 50, 10, 4);
    targetCtx.fill();

    // Exposed Stainless Steel Lip Ring
    targetCtx.fillStyle = '#e5e7eb';
    targetCtx.fillRect(cx - topW / 2 + rotOffset, lidY + lidH - 2, topW, 5);
    targetCtx.restore();

    // 2. Tumbler Tapered Body Path
    function tumblerBodyPath() {
      targetCtx.moveTo(cx - topW / 2 + rotOffset, cy - tumblerH + 4);
      targetCtx.lineTo(cx + topW / 2 + rotOffset, cy - tumblerH + 4);
      // Taper down to base
      targetCtx.lineTo(cx + baseW / 2 + rotOffset, cy - 10);
      targetCtx.quadraticCurveTo(
        cx + baseW / 2 + rotOffset, cy,
        cx + baseW * 0.4 + rotOffset, cy
      );
      targetCtx.lineTo(cx - baseW * 0.4 + rotOffset, cy);
      targetCtx.quadraticCurveTo(
        cx - baseW / 2 + rotOffset, cy,
        cx - baseW / 2 + rotOffset, cy - 10
      );
      targetCtx.closePath();
    }

    targetCtx.save();
    targetCtx.beginPath();
    tumblerBodyPath();

    // Tapered Lighting Gradient
    const tumblerGrad = targetCtx.createLinearGradient(
      cx - topW / 2 + rotOffset, 0,
      cx + topW / 2 + rotOffset, 0
    );
    const hl = 0.5 + lx * 0.35;
    tumblerGrad.addColorStop(0, adjustBrightness(studio.colors.body, 0.5));
    tumblerGrad.addColorStop(Math.max(0.1, hl - 0.25), adjustBrightness(studio.colors.body, 0.85));
    tumblerGrad.addColorStop(Math.min(0.9, Math.max(0.1, hl)), adjustBrightness(studio.colors.body, 1.35));
    tumblerGrad.addColorStop(Math.min(0.9, hl + 0.2), adjustBrightness(studio.colors.body, 0.75));
    tumblerGrad.addColorStop(1, adjustBrightness(studio.colors.body, 0.4));
    targetCtx.fillStyle = tumblerGrad;
    targetCtx.fill();

    // Bottom Silicone Base Boot
    targetCtx.fillStyle = adjustBrightness(studio.colors.cap, 0.8);
    targetCtx.beginPath();
    targetCtx.roundRect(cx - baseW / 2 - 2 + rotOffset, cy - 25, baseW + 4, 25, [0, 0, 6, 6]);
    targetCtx.fill();

    // Material Finish
    applyFinishHighlight(targetCtx, tumblerBodyPath, true);

    // Laser-Engraved / Printed Emblem & Logo
    drawBrandLabel(targetCtx, cx + rotOffset, cy - tumblerH * 0.62, topW * 0.65, tumblerH * 0.45, studio.colors.seal);

    targetCtx.restore();
  }

  // -------------------------------------------------------------
  // STAGE BACKGROUND DRAWING
  // -------------------------------------------------------------
  function drawStageBackdrop(targetCtx, width, height, transparent = false) {
    if (transparent) {
      targetCtx.clearRect(0, 0, width, height);
      return;
    }

    if (studio.stageBg === 'bg-light-studio') {
      const grad = targetCtx.createRadialGradient(
        width / 2, height * 0.35, 50,
        width / 2, height * 0.5, width * 0.7
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#e2e8f0');
      grad.addColorStop(1, '#cbd5e1');
      targetCtx.fillStyle = grad;
      targetCtx.fillRect(0, 0, width, height);
    } else if (studio.stageBg === 'bg-pedestal') {
      // Pedestal Studio
      const bgGrad = targetCtx.createRadialGradient(
        width / 2, height * 0.3, 50,
        width / 2, height * 0.6, width * 0.8
      );
      bgGrad.addColorStop(0, '#2a313d');
      bgGrad.addColorStop(0.7, '#11141a');
      bgGrad.addColorStop(1, '#07090c');
      targetCtx.fillStyle = bgGrad;
      targetCtx.fillRect(0, 0, width, height);

      // Stone Pedestal Disc
      const px = width / 2;
      const py = height / 2 + 100;
      targetCtx.save();
      // Pedestal Base Cylindrical Rim
      targetCtx.fillStyle = '#1e242e';
      targetCtx.beginPath();
      targetCtx.ellipse(px, py + 20, 360, 50, 0, 0, Math.PI * 2);
      targetCtx.fill();

      // Pedestal Top Surface
      const pedGrad = targetCtx.createLinearGradient(px - 360, 0, px + 360, 0);
      pedGrad.addColorStop(0, '#2a3240');
      pedGrad.addColorStop(0.5, '#404c60');
      pedGrad.addColorStop(1, '#202630');
      targetCtx.fillStyle = pedGrad;
      targetCtx.beginPath();
      targetCtx.ellipse(px, py, 360, 48, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      targetCtx.lineWidth = 1.5;
      targetCtx.stroke();
      targetCtx.restore();
    } else if (studio.stageBg === 'bg-transparent-grid') {
      targetCtx.clearRect(0, 0, width, height);
    } else {
      // Default: Dark Luxury Studio
      const grad = targetCtx.createRadialGradient(
        width / 2, height * 0.4, 60,
        width / 2, height * 0.6, width * 0.75
      );
      grad.addColorStop(0, '#1e2634');
      grad.addColorStop(0.65, '#0d1117');
      grad.addColorStop(1, '#05070a');
      targetCtx.fillStyle = grad;
      targetCtx.fillRect(0, 0, width, height);
    }
  }

  // -------------------------------------------------------------
  // MASTER SCENE RENDER
  // -------------------------------------------------------------
  function renderScene(targetCtx = ctx, isTransparent = false) {
    targetCtx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Backdrop
    drawStageBackdrop(targetCtx, canvas.width, canvas.height, isTransparent);

    // Render Chosen Packaging Model
    switch (studio.model) {
      case 'box':
        drawRetailBox(targetCtx);
        break;
      case 'pouch':
        drawStandUpPouch(targetCtx);
        break;
      case 'bottle':
        drawDropperBottle(targetCtx);
        break;
      case 'can':
        drawAluminumCan(targetCtx);
        break;
      case 'tumbler':
        drawCoffeeTumbler(targetCtx);
        break;
      default:
        drawRetailBox(targetCtx);
        break;
    }
  }

  // -------------------------------------------------------------
  // EXPORT UTILITIES
  // -------------------------------------------------------------

  // 1. High-Res PNG Download
  btnDownloadHighRes.addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 2400;
    exportCanvas.height = 1800;
    const expCtx = exportCanvas.getContext('2d');

    expCtx.save();
    expCtx.scale(2400 / 1600, 1800 / 1200);
    renderScene(expCtx, studio.stageBg === 'bg-transparent-grid');
    expCtx.restore();

    const link = document.createElement('a');
    const safeBrand = (studio.branding.title || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `${safeBrand}-${studio.model}-mockup.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showToast('Downloaded High-Res Packaging Mockup!');
  });

  // 2. Transparent PNG Download
  btnDownloadTransparent.addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 2400;
    exportCanvas.height = 1800;
    const expCtx = exportCanvas.getContext('2d');

    expCtx.save();
    expCtx.scale(2400 / 1600, 1800 / 1200);
    renderScene(expCtx, true);
    expCtx.restore();

    const link = document.createElement('a');
    const safeBrand = (studio.branding.title || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `${safeBrand}-${studio.model}-transparent.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showToast('Downloaded Transparent Packaging PNG!');
  });

  // 3. Copy Image to Clipboard
  btnCopyClipboard.addEventListener('click', async () => {
    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 1600;
      exportCanvas.height = 1200;
      const expCtx = exportCanvas.getContext('2d');
      renderScene(expCtx, studio.stageBg === 'bg-transparent-grid');

      exportCanvas.toBlob(async blob => {
        if (!blob) {
          showToast('Failed to generate image blob.', 'error');
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast('Mockup copied to clipboard!');
        } catch (err) {
          console.warn('Clipboard write failed, using data URL fallback:', err);
          showToast('Clipboard write error. Please use download button.', 'error');
        }
      }, 'image/png');
    } catch (e) {
      showToast('Copy to clipboard failed: ' + e.message, 'error');
    }
  });

  // Initial Scene Render
  renderScene();
});