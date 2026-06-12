document.addEventListener('DOMContentLoaded', () => {
  // Inputs
  const bName = document.getElementById('b-name');
  const bTagline = document.getElementById('b-tagline');
  const bCta = document.getElementById('b-cta');
  const bLogo = document.getElementById('b-logo');
  const bHero = document.getElementById('b-hero');
  const bFonts = document.getElementById('b-fonts');
  
  const cPrimary = document.getElementById('c-primary');
  const tPrimary = document.getElementById('t-primary');
  const cSecondary = document.getElementById('c-secondary');
  const tSecondary = document.getElementById('t-secondary');
  const cBg = document.getElementById('c-bg');
  const tBg = document.getElementById('t-bg');
  const cText = document.getElementById('c-text');
  const tText = document.getElementById('t-text');

  const palettePresetsContainer = document.getElementById('palette-presets');

  // Outputs (Collections of elements)
  const dynNames = document.querySelectorAll('.dyn-name');
  const dynTaglines = document.querySelectorAll('.dyn-tagline');
  const dynCtas = document.querySelectorAll('.dyn-cta');
  const dynLogos = document.querySelectorAll('.dyn-logo');
  const dynHeros = document.querySelectorAll('.dyn-hero');
  const assetCanvases = document.querySelectorAll('.asset-canvas');

  // Presets
  const presets = [
    { p: '#d4af37', s: '#ffffff', b: '#0f172a', t: '#f8fafc' }, // Classic Luxury
    { p: '#b76e79', s: '#f5f5dc', b: '#2c3e50', t: '#ffffff' }, // Rose Gold
    { p: '#111827', s: '#4b5563', b: '#f3f4f6', t: '#1f2937' }, // Minimalist Monocrome
    { p: '#14b8a6', s: '#0f766e', b: '#f8fafc', t: '#334155' }, // Modern Teal
    { p: '#f59e0b', s: '#d97706', b: '#ffffff', t: '#1e293b' }, // Vibrant Amber
  ];

  // Helper to convert hex to RGB
  function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `${r}, ${g}, ${b}`;
  }

  // Update DOM elements with values
  function updateBrandAssets() {
    // Content
    dynNames.forEach(el => el.textContent = bName.value);
    dynTaglines.forEach(el => el.textContent = bTagline.value);
    dynCtas.forEach(el => el.textContent = bCta.value);
    
    // Images
    const defaultHero = 'https://images.unsplash.com/photo-1599643478524-fb66f70a00ea?auto=format&fit=crop&w=1080&q=80';
    dynHeros.forEach(el => el.src = bHero.value || defaultHero);

    if (bLogo.value) {
      dynLogos.forEach(el => {
        el.src = bLogo.value;
        el.style.display = 'block';
      });
    } else {
      dynLogos.forEach(el => el.style.display = 'none');
    }

    // Typography
    const fonts = bFonts.value.split('-');
    const fontMap = {
      'cinzel': "'Cinzel', serif",
      'inter': "'Inter', sans-serif",
      'playfair': "'Playfair Display', serif",
      'montserrat': "'Montserrat', sans-serif"
    };

    const fontHeading = fontMap[fonts[0]] || fontMap['inter'];
    const fontBody = fontMap[fonts[1]] || fontMap['inter'];

    // Update CSS Variables locally for each canvas
    assetCanvases.forEach(canvas => {
      canvas.style.setProperty('--brand-primary', cPrimary.value);
      canvas.style.setProperty('--brand-secondary', cSecondary.value);
      canvas.style.setProperty('--brand-bg', cBg.value);
      canvas.style.setProperty('--brand-bg-rgb', hexToRgb(cBg.value));
      canvas.style.setProperty('--brand-text', cText.value);
      
      canvas.style.setProperty('--font-heading', fontHeading);
      canvas.style.setProperty('--font-body', fontBody);
    });
  }

  // Color syncing
  function syncColor(type, val) {
    if (type === 'p') { cPrimary.value = val; tPrimary.value = val; }
    if (type === 's') { cSecondary.value = val; tSecondary.value = val; }
    if (type === 'b') { cBg.value = val; tBg.value = val; }
    if (type === 't') { cText.value = val; tText.value = val; }
    updateBrandAssets();
  }

  // Listeners for Color Pickers
  cPrimary.addEventListener('input', e => syncColor('p', e.target.value));
  tPrimary.addEventListener('input', e => syncColor('p', e.target.value));
  
  cSecondary.addEventListener('input', e => syncColor('s', e.target.value));
  tSecondary.addEventListener('input', e => syncColor('s', e.target.value));
  
  cBg.addEventListener('input', e => syncColor('b', e.target.value));
  tBg.addEventListener('input', e => syncColor('b', e.target.value));
  
  cText.addEventListener('input', e => syncColor('t', e.target.value));
  tText.addEventListener('input', e => syncColor('t', e.target.value));

  // Build Presets
  presets.forEach(p => {
    const btn = document.createElement('div');
    btn.className = 'preset-btn';
    btn.innerHTML = `
      <div style="background: ${p.p}"></div>
      <div style="background: ${p.b}"></div>
    `;
    btn.addEventListener('click', () => {
      syncColor('p', p.p);
      syncColor('s', p.s);
      syncColor('b', p.b);
      syncColor('t', p.t);
    });
    palettePresetsContainer.appendChild(btn);
  });

  // Global Inputs Listener
  [bName, bTagline, bCta, bLogo, bHero, bFonts].forEach(el => {
    el.addEventListener('input', updateBrandAssets);
  });

  // Downloads
  const downloadBtns = document.querySelectorAll('.download-btn');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target');
      const filename = btn.getAttribute('data-filename');
      const targetEl = document.getElementById(targetId);
      
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Saving...';
      btn.disabled = true;

      const targetWidth = targetId.includes('fb') ? 820 : 1080;
      
      // Temporarily remove transform for accurate html2canvas rendering
      const originalTransform = targetEl.style.transform;
      targetEl.style.transform = 'none';

      html2canvas(targetEl, {
        scale: 1, // Canvas is already at target dimensions natively
        useCORS: true,
        backgroundColor: cBg.value
      }).then(canvas => {
        targetEl.style.transform = originalTransform;

        const link = document.createElement('a');
        link.download = `${bName.value.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${filename}`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        btn.innerHTML = originalText;
        btn.disabled = false;
      }).catch(err => {
        targetEl.style.transform = originalTransform;
        console.error('Error generating image', err);
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert('Could not generate image. Check if images have CORS issues.');
      });
    });
  });

  // Visual scaling of the absolute fixed size canvases
  function resizeCanvases() {
    const containers = document.querySelectorAll('.asset-canvas-container');
    containers.forEach(container => {
      const canvas = container.querySelector('.asset-canvas');
      if (!canvas) return;
      
      const targetWidth = parseFloat(canvas.style.width);
      const targetHeight = parseFloat(canvas.style.height);
      const containerWidth = container.clientWidth;
      
      if (!targetWidth || !containerWidth) return;
      
      const scale = containerWidth / targetWidth;
      
      canvas.style.transform = `scale(${scale})`;
      container.style.height = `${targetHeight * scale}px`;
    });
  }

  window.addEventListener('resize', resizeCanvases);

  // Init
  updateBrandAssets();
  // Delay slightly to ensure layout is calculated before scaling
  setTimeout(resizeCanvases, 50);
});
