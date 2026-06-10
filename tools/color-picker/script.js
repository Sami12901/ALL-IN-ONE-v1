// Color Picker Logic
document.addEventListener('DOMContentLoaded', () => {
  const colorBlock = document.getElementById('color-block');
  const ctxBlock = colorBlock.getContext('2d');
  const colorStrip = document.getElementById('color-strip');
  const ctxStrip = colorStrip.getContext('2d');
  
  const eyeDropperBtn = document.getElementById('eye-dropper-btn');
  const swatch = document.getElementById('color-swatch');
  const selectedHexTitle = document.getElementById('selected-hex-title');
  const propHex = document.getElementById('prop-hex');
  const propRgb = document.getElementById('prop-rgb');
  const propHsl = document.getElementById('prop-hsl');
  const recentPalette = document.getElementById('recent-palette');

  let activeColor = 'rgba(79, 70, 229, 1)';
  let activeHue = 'rgba(79, 70, 229, 1)';
  let blockX = 150;
  let blockY = 75;

  // EyeDropper API check
  if (window.EyeDropper) {
    eyeDropperBtn.style.display = 'block';
    eyeDropperBtn.addEventListener('click', () => {
      const eyeDropper = new EyeDropper();
      eyeDropper.open().then(result => {
        updateColorDisplay(result.sRGBHex);
        addRecentColor(result.sRGBHex);
      }).catch(err => console.log('Eyedropper closed or failed', err));
    });
  }

  // Draw Saturation/Value Canvas block
  function drawBlock() {
    ctxBlock.fillStyle = activeHue;
    ctxBlock.fillRect(0, 0, 300, 150);

    const whiteGrad = ctxBlock.createLinearGradient(0, 0, 300, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctxBlock.fillStyle = whiteGrad;
    ctxBlock.fillRect(0, 0, 300, 150);

    const blackGrad = ctxBlock.createLinearGradient(0, 0, 0, 150);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctxBlock.fillStyle = blackGrad;
    ctxBlock.fillRect(0, 0, 300, 150);

    // Draw selection marker
    ctxBlock.beginPath();
    ctxBlock.arc(blockX, blockY, 5, 0, 2 * Math.PI);
    ctxBlock.strokeStyle = 'white';
    ctxBlock.lineWidth = 2;
    ctxBlock.stroke();
    ctxBlock.beginPath();
    ctxBlock.arc(blockX, blockY, 4, 0, 2 * Math.PI);
    ctxBlock.strokeStyle = 'black';
    ctxBlock.lineWidth = 1;
    ctxBlock.stroke();
  }

  // Draw Hue Strip Canvas
  function drawStrip() {
    ctxStrip.rect(0, 0, 300, 20);
    const grid = ctxStrip.createLinearGradient(0, 0, 300, 0);
    grid.addColorStop(0, 'rgba(255, 0, 0, 1)');
    grid.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
    grid.addColorStop(0.34, 'rgba(0, 255, 255, 1)');
    grid.addColorStop(0.51, 'rgba(0, 0, 255, 1)');
    grid.addColorStop(0.68, 'rgba(255, 0, 255, 1)');
    grid.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
    grid.addColorStop(1, 'rgba(255, 0, 0, 1)');
    ctxStrip.fillStyle = grid;
    ctxStrip.fill();
  }

  // Pick color from block
  function pickBlockColor(e) {
    const rect = colorBlock.getBoundingClientRect();
    blockX = Math.max(0, Math.min(299, (e.clientX - rect.left)));
    blockY = Math.max(0, Math.min(149, (e.clientY - rect.top)));
    
    const imgData = ctxBlock.getImageData(blockX, blockY, 1, 1).data;
    const hex = rgbToHex(imgData[0], imgData[1], imgData[2]);
    
    updateColorDisplay(hex);
    drawBlock();
  }

  // Pick hue from strip
  function pickStripColor(e) {
    const rect = colorStrip.getBoundingClientRect();
    const x = Math.max(0, Math.min(299, (e.clientX - rect.left)));
    const imgData = ctxStrip.getImageData(x, 10, 1, 1).data;
    activeHue = `rgba(${imgData[0]}, ${imgData[1]}, ${imgData[2]}, 1)`;
    
    drawBlock();
    
    // Pick color at current block position under new hue
    const blockImgData = ctxBlock.getImageData(blockX, blockY, 1, 1).data;
    const hex = rgbToHex(blockImgData[0], blockImgData[1], blockImgData[2]);
    updateColorDisplay(hex);
  }

  // Convert functions
  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
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

  function updateColorDisplay(hex) {
    swatch.style.backgroundColor = hex;
    selectedHexTitle.textContent = hex;
    propHex.value = hex;

    const rgb = hexToRgb(hex);
    if (rgb) {
      propRgb.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      propHsl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
  }

  // Canvas events
  let isBlockDrag = false;
  colorBlock.addEventListener('mousedown', (e) => { isBlockDrag = true; pickBlockColor(e); });
  window.addEventListener('mouseup', () => { isBlockDrag = false; });
  colorBlock.addEventListener('mousemove', (e) => { if (isBlockDrag) pickBlockColor(e); });

  colorStrip.addEventListener('mousedown', pickStripColor);

  // Copy buttons
  document.querySelectorAll('.copy-field-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      navigator.clipboard.writeText(input.value).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    });
  });

  // Recent Palette
  const recents = ['#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#7c3aed', '#ec4899'];
  function renderRecents() {
    recentPalette.innerHTML = recents.map(c => `
      <div class="recent-swatch" style="width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: \${c}; cursor: pointer;"></div>
    `).join('');
    
    recentPalette.querySelectorAll('.recent-swatch').forEach((s, idx) => {
      s.addEventListener('click', () => {
        updateColorDisplay(recents[idx]);
      });
    });
  }

  function addRecentColor(hex) {
    if (recents.includes(hex)) return;
    recents.unshift(hex);
    if (recents.length > 12) recents.pop();
    renderRecents();
  }

  drawStrip();
  drawBlock();
  renderRecents();
  updateColorDisplay('#4f46e5');
});