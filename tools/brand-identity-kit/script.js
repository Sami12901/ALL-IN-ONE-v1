// Brand Identity Kit Generator Logic
document.addEventListener('DOMContentLoaded', () => {

  const inputs = {
    name: document.getElementById('inp-name'),
    tagline: document.getElementById('inp-tagline'),
    mission: document.getElementById('inp-mission'),
    color: document.getElementById('inp-color'),
    font: document.getElementById('inp-font'),
    logo: document.getElementById('inp-logo')
  };

  const docEl = document.getElementById('pdf-document');
  const scaleWrapper = document.getElementById('scale-wrapper');
  
  const outs = {
    title: document.getElementById('out-name-title'),
    tagline: document.getElementById('out-tagline'),
    mission: document.getElementById('out-mission'),
    fontH: document.getElementById('out-font-h'),
    fontB: document.getElementById('out-font-b'),
    logo: document.getElementById('out-logo-cover')
  };

  // Color Swatches
  const swatches = {
    main: { box: document.getElementById('swatch-main'), hex: document.getElementById('hex-main'), rgb: document.getElementById('rgb-main'), cmyk: document.getElementById('cmyk-main') },
    sec: { box: document.getElementById('swatch-sec'), hex: document.getElementById('hex-sec'), rgb: document.getElementById('rgb-sec'), cmyk: document.getElementById('cmyk-sec') },
    light: { box: document.getElementById('swatch-light'), hex: document.getElementById('hex-light'), rgb: document.getElementById('rgb-light'), cmyk: document.getElementById('cmyk-light') }
  };

  // --- Color Math Helpers ---
  function hexToRgb(hex) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));
    
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    
    c = Math.round((c - k) / (1 - k) * 100);
    m = Math.round((m - k) / (1 - k) * 100);
    y = Math.round((y - k) / (1 - k) * 100);
    k = Math.round(k * 100);
    return { c, m, y, k };
  }

  function adjustBrightness(hex, percent) {
    let { r, g, b } = hexToRgb(hex);
    r = Math.max(0, Math.min(255, r + (r * percent / 100)));
    g = Math.max(0, Math.min(255, g + (g * percent / 100)));
    b = Math.max(0, Math.min(255, b + (b * percent / 100)));
    return `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`;
  }
  
  function rgbToHex(r, g, b) {
     return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  // Very simple analogous/monochromatic generation
  function generatePalette(hex) {
    const main = hex;
    // Secondary: Slightly lighter or shifted (we'll just lighten for luxury monochromatic feel)
    const sec = adjustBrightness(main, 40);
    // Light: Very pale version for backgrounds
    let {r, g, b} = hexToRgb(main);
    // Mix 90% white
    r = Math.round(r * 0.1 + 255 * 0.9);
    g = Math.round(g * 0.1 + 255 * 0.9);
    b = Math.round(b * 0.1 + 255 * 0.9);
    const light = rgbToHex(r, g, b);

    return { main, sec, light };
  }

  function updateSwatch(swatchObj, hexColor) {
    swatchObj.box.style.backgroundColor = hexColor;
    swatchObj.hex.textContent = hexColor.toUpperCase();
    
    const rgb = hexToRgb(hexColor);
    swatchObj.rgb.textContent = `${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}`;
    
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    swatchObj.cmyk.textContent = `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`;
  }

  // --- Dynamic Layout Engine ---
  function updateDocument() {
    // Content
    outs.title.textContent = inputs.name.value || 'BRAND';
    outs.tagline.textContent = inputs.tagline.value;
    outs.mission.textContent = inputs.mission.value;

    // Fonts
    docEl.className = `brand-doc ${inputs.font.value}`;
    const fontNames = {
      'font-playfair': ['Playfair Display', 'Lato'],
      'font-cinzel': ['Cinzel', 'Montserrat'],
      'font-bodoni': ['Bodoni Moda', 'Inter'],
      'font-inter': ['Inter', 'Roboto']
    };
    outs.fontH.textContent = fontNames[inputs.font.value][0];
    outs.fontB.textContent = fontNames[inputs.font.value][1];

    // Colors
    const palette = generatePalette(inputs.color.value);
    
    // Set CSS Vars
    docEl.style.setProperty('--brand-color', palette.main);
    docEl.style.setProperty('--brand-sec', palette.sec);
    docEl.style.setProperty('--brand-light', palette.light);
    
    // Update Swatches UI
    updateSwatch(swatches.main, palette.main);
    updateSwatch(swatches.sec, palette.sec);
    updateSwatch(swatches.light, palette.light);
    
    autoScaleCanvas();
  }

  // Bind text and select inputs
  ['name', 'tagline', 'mission', 'color', 'font'].forEach(key => {
    inputs[key].addEventListener('input', updateDocument);
    inputs[key].addEventListener('change', updateDocument);
  });

  // --- Image Upload Handlers ---
  inputs.logo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      outs.logo.src = url;
    }
  });

  // --- Viewport Scaling ---
  function autoScaleCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper');
    const ww = wrapper.clientWidth - 40; 
    
    // A4 width is 794px in our CSS. We only scale by width to fit the column.
    const scale = Math.min(ww / 794, 1);
    
    // We only scale down, not up.
    scaleWrapper.style.transform = `scale(${scale})`;
    // Adjust height so container doesn't overflow visually (scale transform leaves ghost space)
    // The height of 3 pages + gap is roughly 3400px.
    const totalHeight = 1123 * 3 + 40;
    scaleWrapper.style.height = `${totalHeight * scale}px`;
    scaleWrapper.style.marginBottom = `${totalHeight * (1 - scale)}px`; 
  }

  window.addEventListener('resize', autoScaleCanvas);
  
  // Initial render
  setTimeout(updateDocument, 100);

  // --- Export PDF (html2pdf) ---
  document.getElementById('btn-export').addEventListener('click', () => {
    const btn = document.getElementById('btn-export');
    const originalText = btn.innerText;
    btn.innerText = "Generating PDF...";
    btn.disabled = true;

    // Temporarily remove scale and gaps for perfect PDF mapping
    scaleWrapper.style.transform = 'scale(1)';
    docEl.style.gap = '0px';

    const opt = {
      margin:       0,
      filename:     `Brand_Guidelines_${inputs.name.value.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(docEl).save().then(() => {
      // Restore styles
      docEl.style.gap = '20px';
      autoScaleCanvas();
      btn.innerText = originalText;
      btn.disabled = false;
    }).catch(err => {
      console.error(err);
      docEl.style.gap = '20px';
      autoScaleCanvas();
      btn.innerText = originalText;
      btn.disabled = false;
      alert("Error generating PDF.");
    });
  });

});