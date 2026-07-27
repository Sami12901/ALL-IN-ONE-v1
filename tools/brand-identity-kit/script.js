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

  // 42+ Typography Themes
  const themesData = {
    'theme-1': { head: 'Playfair Display', body: 'Lato', label: 'Classic Luxury' },
    'theme-2': { head: 'Cinzel', body: 'Montserrat', label: 'Modern Elegance' },
    'theme-3': { head: 'Bodoni Moda', body: 'Inter', label: 'High Fashion' },
    'theme-4': { head: 'Inter', body: 'Roboto', label: 'Tech Minimalist' },
    'theme-5': { head: 'Oswald', body: 'Open Sans', label: 'Bold Industrial' },
    'theme-6': { head: 'Raleway', body: 'Roboto Slab', label: 'Refined Serif' },
    'theme-7': { head: 'Merriweather', body: 'Source Sans 3', label: 'Editorial' },
    'theme-8': { head: 'Lora', body: 'Merriweather Sans', label: 'Literary' },
    'theme-9': { head: 'PT Serif', body: 'PT Sans', label: 'Academic' },
    'theme-10': { head: 'Roboto Condensed', body: 'Roboto', label: 'Compact Modern' },
    'theme-11': { head: 'Ubuntu', body: 'Open Sans', label: 'Friendly Tech' },
    'theme-12': { head: 'Fira Sans', body: 'Merriweather', label: 'Dynamic Contrast' },
    'theme-13': { head: 'Poppins', body: 'Roboto', label: 'Geometric Pop' },
    'theme-14': { head: 'Nunito', body: 'Nunito Sans', label: 'Soft Rounded' },
    'theme-15': { head: 'Quicksand', body: 'Open Sans', label: 'Light Airy' },
    'theme-16': { head: 'Work Sans', body: 'Roboto', label: 'Pragmatic' },
    'theme-17': { head: 'Rubik', body: 'Karla', label: 'Chunky Grotesk' },
    'theme-18': { head: 'Cormorant Garamond', body: 'Proza Libre', label: 'Vogue Editorial' },
    'theme-19': { head: 'Libre Baskerville', body: 'Source Sans 3', label: 'Heritage' },
    'theme-20': { head: 'Josefin Sans', body: 'Lato', label: 'Vintage Geometric' },
    'theme-21': { head: 'Abril Fatface', body: 'Lato', label: 'Bold Editorial' },
    'theme-22': { head: 'Arvo', body: 'Lato', label: 'Slab Impact' },
    'theme-23': { head: 'Bebas Neue', body: 'Montserrat', label: 'Cinematic' },
    'theme-24': { head: 'Anton', body: 'Roboto', label: 'Heavy Impact' },
    'theme-25': { head: 'Fjalla One', body: 'Noto Sans', label: 'Tall Modern' },
    'theme-26': { head: 'Dancing Script', body: 'Lato', label: 'Script Elegance' },
    'theme-27': { head: 'Pacifico', body: 'Open Sans', label: 'Casual Script' },
    'theme-28': { head: 'Crimson Text', body: 'Work Sans', label: 'Traditional Serif' },
    'theme-29': { head: 'Bitter', body: 'Source Sans 3', label: 'Solid Slab' },
    'theme-30': { head: 'DM Serif Display', body: 'DM Sans', label: 'Contemporary Serif' },
    'theme-31': { head: 'EB Garamond', body: 'Montserrat', label: 'Classic Revival' },
    'theme-32': { head: 'Space Grotesk', body: 'Space Mono', label: 'Developer Minimal' },
    'theme-33': { head: 'Syne', body: 'Inter', label: 'Avant Garde' },
    'theme-34': { head: 'Bungee', body: 'Roboto', label: 'Retro Arcade' },
    'theme-35': { head: 'Righteous', body: 'Open Sans', label: 'Deco Modern' },
    'theme-36': { head: 'Lobster', body: 'Lato', label: 'Playful Script' },
    'theme-37': { head: 'Zilla Slab', body: 'Lato', label: 'Friendly Slab' },
    'theme-38': { head: 'Archivo Black', body: 'Archivo', label: 'Ultra Bold' },
    'theme-39': { head: 'Comfortaa', body: 'Open Sans', label: 'Organic Rounded' },
    'theme-40': { head: 'Manrope', body: 'Roboto', label: 'Modern Geometric' },
    'theme-41': { head: 'Mulish', body: 'Nunito', label: 'Clean Interface' },
    'theme-42': { head: 'Outfit', body: 'Roboto', label: 'Brand Geometric' }
  };

  // Populate Select Options
  inputs.font.innerHTML = '';
  Object.keys(themesData).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${themesData[key].head} & ${themesData[key].body} (${themesData[key].label})`;
    inputs.font.appendChild(opt);
  });
  inputs.font.value = 'theme-1';

  // Dynamic Google Font Loader
  let loadedFonts = new Set();
  function loadFonts(headFont, bodyFont) {
    const fontStr = `${headFont}|${bodyFont}`.replace(/ /g, '+');
    if (loadedFonts.has(fontStr)) return;
    loadedFonts.add(fontStr);
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${headFont.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,700;1,400&family=${bodyFont.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,700;1,400&display=swap`;
    document.head.appendChild(link);
  }

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

  function generatePalette(hex) {
    const main = hex;
    const sec = adjustBrightness(main, 40);
    let {r, g, b} = hexToRgb(main);
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
    const theme = themesData[inputs.font.value];
    outs.fontH.textContent = theme.head;
    outs.fontB.textContent = theme.body;
    
    // Load external fonts dynamically
    loadFonts(theme.head, theme.body);

    // Apply CSS Variables for Fonts dynamically instead of static classes
    docEl.style.setProperty('--f-head', `"${theme.head}", serif`);
    docEl.style.setProperty('--f-body', `"${theme.body}", sans-serif`);

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
    const scale = Math.min(ww / 794, 1);
    
    scaleWrapper.style.transform = `scale(${scale})`;
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